package com.yuzhi.dts.common.content;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.StreamReadConstraints;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Offline lint for a DTS Wiki content repository (wiki-content v1): space manifest, roots,
 * DTS-MD frontmatter and sealed archives. Never connects to a wiki, database or network.
 *
 * <p>Layout checked: {@code <manifest-dir>/spaces/<slug>/...} must belong to a declared space;
 * every {@code <manifest-dir>/spaces/<slug>/archive/<name>/} must match
 * {@code <manifest-dir>/checksums/<slug>/<name>.sha256} exactly.
 */
public final class ContentLint {
    public static final String DEFAULT_MANIFEST = "dts-worklog/spaces.yml";
    static final Set<String> KNOWN_TYPES = Set.of("sprint", "feature", "task", "adr", "evidence", "page");
    private static final int MAX_FILES = 50_000;
    private static final int MAX_FILE = 16 * 1024 * 1024;
    /** Same split rule as dts-wiki FrontmatterParser (design 10 S3.1). */
    private static final Pattern FRONTMATTER = Pattern.compile("\\A---\\r?\\n(.*?)\\r?\\n---(\\r?\\n|[\\r\\n]?)(.*)\\z", Pattern.DOTALL);

    private final ObjectMapper yaml;
    private final JsonSchemaFactory schemas = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V202012);
    private final Map<String, JsonSchema> cache = new HashMap<>();

    public ContentLint() {
        YAMLFactory factory = new YAMLFactory();
        factory.setStreamReadConstraints(StreamReadConstraints.builder().maxNestingDepth(64).maxStringLength(MAX_FILE).build());
        yaml = new ObjectMapper(factory).enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION);
    }

    public record Report(int spaces, int files, int frontmatter, int archives, List<String> errors) {
        public boolean ok() { return errors.isEmpty(); }
    }

    public static void main(String[] args) {
        System.exit(run(args));
    }

    public static int run(String[] args) {
        try {
            if (args.length >= 2 && args[0].equals("check") && (args.length == 2 || args.length == 4 && args[2].equals("--manifest"))) {
                Report report = new ContentLint().check(Path.of(args[1]), args.length == 4 ? args[3] : DEFAULT_MANIFEST);
                report.errors().stream().limit(200).forEach(error -> System.err.println("ERROR " + error));
                if (report.errors().size() > 200) System.err.println("... " + (report.errors().size() - 200) + " more errors");
                System.out.printf("%d spaces, %d files, %d with frontmatter, %d sealed archives, %d errors%n",
                        report.spaces(), report.files(), report.frontmatter(), report.archives(), report.errors().size());
                return report.ok() ? 0 : 1;
            }
            if (args.length == 2 && args[0].equals("seal")) {
                Path archive = Path.of(args[1]).toAbsolutePath().normalize();
                Path sums = sealPath(archive);
                if (Files.exists(sums)) throw new IllegalArgumentException("Archive already sealed: " + sums);
                Files.createDirectories(sums.getParent());
                StringBuilder out = new StringBuilder();
                checksums(archive).forEach((name, hash) -> out.append(hash).append("  ").append(name).append('\n'));
                Files.writeString(sums, out, StandardCharsets.UTF_8, java.nio.file.StandardOpenOption.CREATE_NEW);
                System.out.println("Sealed " + sums);
                return 0;
            }
            System.err.println("Usage: content-lint check <repository-root> [--manifest <path>] | seal <archive-directory>");
            return 1;
        } catch (Exception e) {
            System.err.println("Content lint failed: " + e.getMessage());
            return 1;
        }
    }

    public Report check(Path repository, String manifestPath) throws IOException {
        Path root = repository.toAbsolutePath().normalize();
        Path manifestFile = root.resolve(manifestPath).normalize();
        List<String> errors = new ArrayList<>();
        if (!manifestFile.startsWith(root) || !Files.isRegularFile(manifestFile, LinkOption.NOFOLLOW_LINKS)) {
            errors.add(manifestPath + ": manifest missing");
            return new Report(0, 0, 0, 0, errors);
        }
        JsonNode manifest = yaml.readTree(manifestFile.toFile());
        validate("wiki-content/space-manifest.v1.schema.json", manifest).forEach(e -> errors.add(manifestPath + ": " + e));
        if (!errors.isEmpty()) return new Report(0, 0, 0, 0, errors);

        Path contentDir = manifestFile.getParent();
        Map<String, String> rootOwner = new TreeMap<>();
        int files = 0, frontmatter = 0;
        for (JsonNode space : manifest.path("spaces")) {
            String slug = space.path("slug").asText();
            if (!space.path("role").asText().equals("space-" + slug)) errors.add(manifestPath + ": role of " + slug + " must be space-" + slug);
            Map<String, String> ids = new HashMap<>();
            for (JsonNode node : space.path("roots")) {
                String rootPath = node.asText();
                String previous = rootOwner.put(rootPath, slug);
                if (previous != null) errors.add(manifestPath + ": root " + rootPath + " declared by " + previous + " and " + slug);
                for (String other : rootOwner.keySet()) {
                    if (!other.equals(rootPath) && (other.startsWith(rootPath + "/") || rootPath.startsWith(other + "/")))
                        errors.add(manifestPath + ": roots overlap: " + other + ", " + rootPath);
                }
                Path dir = root.resolve(rootPath).normalize();
                if (!dir.startsWith(root) || !Files.isDirectory(dir, LinkOption.NOFOLLOW_LINKS)) {
                    errors.add(manifestPath + ": root of " + slug + " is not a directory: " + rootPath);
                    continue;
                }
                for (Path file : walk(dir, errors, root)) {
                    files++;
                    if (!file.getFileName().toString().endsWith(".md")) continue;
                    String rel = root.relativize(file).toString();
                    if (Files.size(file) > MAX_FILE) { errors.add(rel + ": file too large"); continue; }
                    Matcher matcher = FRONTMATTER.matcher(Files.readString(file, StandardCharsets.UTF_8));
                    if (!matcher.matches()) continue;
                    frontmatter++;
                    checkFrontmatter(rel, matcher.group(1), ids, errors);
                }
            }
        }
        Path spacesDir = contentDir.resolve("spaces");
        if (Files.isDirectory(spacesDir, LinkOption.NOFOLLOW_LINKS)) {
            try (var children = Files.list(spacesDir)) {
                for (Path child : children.sorted().toList()) {
                    String rel = root.relativize(child).toString();
                    boolean declared = rootOwner.keySet().stream().anyMatch(r -> r.equals(rel) || r.startsWith(rel + "/"));
                    if (Files.isDirectory(child, LinkOption.NOFOLLOW_LINKS) && !declared)
                        errors.add(rel + ": space directory not declared in " + manifestPath);
                }
            }
        }
        int archives = checkArchives(root, contentDir, errors);
        return new Report(manifest.path("spaces").size(), files, frontmatter, archives, errors);
    }

    private void checkFrontmatter(String rel, String text, Map<String, String> ids, List<String> errors) {
        JsonNode data;
        try {
            data = yaml.readTree(text);
        } catch (IOException e) {
            errors.add(rel + ": invalid YAML frontmatter: " + firstLine(e.getMessage()));
            return;
        }
        if (data == null || data.isMissingNode() || data.isNull()) return;
        if (!data.isObject()) { errors.add(rel + ": frontmatter must be a mapping"); return; }
        String type = data.path("type").asText(null);
        // Unknown types are plain pages and are not validated (wiki design 09 S3.3).
        if (type == null || KNOWN_TYPES.contains(type)) {
            String schema = "wiki-content/frontmatter/" + (type == null ? "page" : type) + ".v1.schema.json";
            validate(schema, data).forEach(e -> errors.add(rel + ": " + e));
        }
        String id = data.path("id").asText(null);
        if (id != null) {
            String other = ids.putIfAbsent(id, rel);
            if (other != null) errors.add(rel + ": id " + id + " duplicates " + other);
        }
    }

    private int checkArchives(Path root, Path contentDir, List<String> errors) throws IOException {
        int count = 0;
        Path spaces = contentDir.resolve("spaces");
        if (!Files.isDirectory(spaces, LinkOption.NOFOLLOW_LINKS)) return 0;
        try (var slugs = Files.list(spaces)) {
            for (Path slug : slugs.sorted().toList()) {
                Path archiveDir = slug.resolve("archive");
                if (!Files.isDirectory(archiveDir, LinkOption.NOFOLLOW_LINKS)) continue;
                try (var archives = Files.list(archiveDir)) {
                    for (Path archive : archives.sorted().toList()) {
                        String rel = root.relativize(archive).toString();
                        if (!Files.isDirectory(archive, LinkOption.NOFOLLOW_LINKS)) {
                            errors.add(rel + ": archive entries must be sealed directories");
                            continue;
                        }
                        count++;
                        Path sums = sealPath(archive);
                        if (!Files.isRegularFile(sums, LinkOption.NOFOLLOW_LINKS)) {
                            errors.add(rel + ": archive not sealed (missing " + root.relativize(sums) + ")");
                            continue;
                        }
                        Map<String, String> expected = new TreeMap<>();
                        for (String line : Files.readAllLines(sums, StandardCharsets.UTF_8)) {
                            if (line.isBlank()) continue;
                            int split = line.indexOf("  ");
                            if (split != 64) { errors.add(root.relativize(sums) + ": malformed line"); continue; }
                            expected.put(line.substring(66), line.substring(0, 64));
                        }
                        Map<String, String> actual = checksums(archive);
                        for (var entry : expected.entrySet()) {
                            String hash = actual.get(entry.getKey());
                            if (hash == null) errors.add(rel + "/" + entry.getKey() + ": removed from sealed archive");
                            else if (!hash.equals(entry.getValue())) errors.add(rel + "/" + entry.getKey() + ": modified in sealed archive");
                        }
                        for (String name : actual.keySet())
                            if (!expected.containsKey(name)) errors.add(rel + "/" + name + ": added to sealed archive");
                    }
                }
            }
        }
        return count;
    }

    /** {@code <content>/spaces/<slug>/archive/<name>} is sealed by {@code <content>/checksums/<slug>/<name>.sha256}. */
    static Path sealPath(Path archive) {
        Path archiveDir = archive.getParent();
        if (archiveDir == null || !archiveDir.getFileName().toString().equals("archive"))
            throw new IllegalArgumentException("Not an archive directory: " + archive);
        Path slug = archiveDir.getParent();
        Path spaces = slug.getParent();
        if (spaces == null || !spaces.getFileName().toString().equals("spaces"))
            throw new IllegalArgumentException("Archive must be under spaces/<slug>/archive/: " + archive);
        return spaces.getParent().resolve("checksums").resolve(slug.getFileName().toString())
                .resolve(archive.getFileName() + ".sha256");
    }

    static Map<String, String> checksums(Path directory) throws IOException {
        Map<String, String> out = new TreeMap<>();
        for (Path file : walk(directory, new ArrayList<>(), directory)) {
            out.put(directory.relativize(file).toString().replace(java.io.File.separatorChar, '/'), sha256(file));
        }
        return out;
    }

    private static List<Path> walk(Path dir, List<String> errors, Path root) throws IOException {
        List<Path> files = new ArrayList<>();
        try (var paths = Files.walk(dir)) {
            for (Path path : (Iterable<Path>) paths.sorted()::iterator) {
                if (files.size() > MAX_FILES) throw new IllegalArgumentException("Too many files under " + dir);
                if (Files.isSymbolicLink(path)) { errors.add(root.relativize(path) + ": symlinks are not allowed in content"); continue; }
                if (Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS)) files.add(path);
            }
        }
        return files;
    }

    private List<String> validate(String name, JsonNode value) {
        JsonSchema schema = cache.computeIfAbsent(name, key -> {
            try (InputStream stream = ContentLint.class.getResourceAsStream("/protocol/" + key)) {
                if (stream == null) throw new IllegalStateException("Missing bundled schema: " + key);
                return schemas.getSchema(stream);
            } catch (IOException e) {
                throw new IllegalStateException(e);
            }
        });
        return schema.validate(value).stream().map(Object::toString).sorted().toList();
    }

    private static String sha256(Path file) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream stream = Files.newInputStream(file)) {
                byte[] buffer = new byte[64 * 1024];
                for (int n; (n = stream.read(buffer)) > 0; ) digest.update(buffer, 0, n);
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String firstLine(String message) {
        if (message == null) return "";
        int newline = message.indexOf('\n');
        return newline < 0 ? message : message.substring(0, newline);
    }
}
