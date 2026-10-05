package com.yuzhi.dts.common.content;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.assertj.core.api.Assertions.*;

class ContentLintTest {
    @TempDir Path repo;

    static final String MANIFEST = """
            version: 1
            spaces:
              - slug: dts
                name: DTS
                roots: [dts-docs]
                role: space-dts
              - slug: rdc
                name: RDC
                roots: [dts-worklog/spaces/rdc/worklog, dts-worklog/spaces/rdc/archive]
                role: space-rdc
            """;

    @BeforeEach void layout() throws Exception {
        write("dts-worklog/spaces.yml", MANIFEST);
        write("dts-docs/README.md", "# Docs\n");
        write("dts-worklog/spaces/rdc/worklog/README.md", """
                ---
                type: task
                id: S5/F0/T20
                feature: S5/F0
                title: Split
                status: IN_PROGRESS
                ---
                # T20
                """);
        write("dts-worklog/spaces/rdc/worklog/notes.md", "---\ntype: meeting\nanything: goes\n---\nbody\n");
        write("dts-worklog/spaces/rdc/archive/old-worklog/a.md", "# old\n");
        write("dts-worklog/spaces/rdc/archive/old-worklog/x/b.png", "png");
        assertThat(ContentLint.run(new String[]{"seal", repo.resolve("dts-worklog/spaces/rdc/archive/old-worklog").toString()})).isZero();
    }

    @Test void validRepositoryPasses() throws Exception {
        var report = lint();
        assertThat(report.errors()).isEmpty();
        assertThat(report.spaces()).isEqualTo(2);
        assertThat(report.frontmatter()).isEqualTo(2);
        assertThat(report.archives()).isEqualTo(1);
        assertThat(ContentLint.run(new String[]{"check", repo.toString()})).isZero();
        assertThat(Files.readString(repo.resolve("dts-worklog/checksums/rdc/old-worklog.sha256"))).contains("  a.md\n", "  x/b.png\n");
    }

    @Test void manifestSchemaAndConsistencyAreEnforced() throws Exception {
        write("dts-worklog/spaces.yml", MANIFEST.replace("role: space-dts", "role: space-other").replace("[dts-docs]", "[dts-docs, ../escape]"));
        assertThat(lint().errors()).anyMatch(e -> e.contains("pattern"));
        write("dts-worklog/spaces.yml", MANIFEST.replace("role: space-dts", "role: space-other"));
        assertThat(lint().errors()).anyMatch(e -> e.contains("role of dts must be space-dts"));
        write("dts-worklog/spaces.yml", MANIFEST.replace("[dts-docs]", "[dts-worklog/spaces/rdc]"));
        assertThat(lint().errors()).anyMatch(e -> e.contains("roots overlap"));
        write("dts-worklog/spaces.yml", MANIFEST.replace("[dts-docs]", "[missing]"));
        assertThat(lint().errors()).anyMatch(e -> e.contains("not a directory: missing"));
    }

    @Test void undeclaredSpaceDirectoryFails() throws Exception {
        write("dts-worklog/spaces/prs/worklog/README.md", "# prs\n");
        assertThat(lint().errors()).containsExactly("dts-worklog/spaces/prs: space directory not declared in dts-worklog/spaces.yml");
    }

    @Test void frontmatterIsValidatedForKnownTypesAndIdsAreUnique() throws Exception {
        write("dts-worklog/spaces/rdc/worklog/bad.md", "---\ntype: task\nid: T1\ntitle: x\nstatus: WIP\n---\n");
        write("dts-worklog/spaces/rdc/worklog/broken.md", "---\ntype: [unclosed\n---\n");
        write("dts-worklog/spaces/rdc/worklog/dup.md", "---\ntype: page\nid: S5/F0/T20\n---\n");
        write("dts-docs/same-id-other-space.md", "---\nid: S5/F0/T20\n---\n");
        var errors = lint().errors();
        assertThat(errors).anyMatch(e -> e.startsWith("dts-worklog/spaces/rdc/worklog/bad.md:") && e.contains("feature"));
        assertThat(errors).anyMatch(e -> e.startsWith("dts-worklog/spaces/rdc/worklog/bad.md:") && e.contains("status"));
        assertThat(errors).anyMatch(e -> e.startsWith("dts-worklog/spaces/rdc/worklog/broken.md: invalid YAML"));
        assertThat(errors).anyMatch(e -> e.contains("dup.md: id S5/F0/T20 duplicates"));
        assertThat(errors).noneMatch(e -> e.contains("same-id-other-space"));
    }

    @Test void sealedArchivesAreImmutable() throws Exception {
        Path archive = repo.resolve("dts-worklog/spaces/rdc/archive/old-worklog");
        write("dts-worklog/spaces/rdc/archive/old-worklog/a.md", "# edited\n");
        Files.delete(archive.resolve("x/b.png"));
        write("dts-worklog/spaces/rdc/archive/old-worklog/new.md", "# new\n");
        write("dts-worklog/spaces/rdc/archive/unsealed/c.md", "# c\n");
        assertThat(lint().errors()).containsExactlyInAnyOrder(
                "dts-worklog/spaces/rdc/archive/old-worklog/a.md: modified in sealed archive",
                "dts-worklog/spaces/rdc/archive/old-worklog/x/b.png: removed from sealed archive",
                "dts-worklog/spaces/rdc/archive/old-worklog/new.md: added to sealed archive",
                "dts-worklog/spaces/rdc/archive/unsealed: archive not sealed (missing dts-worklog/checksums/rdc/unsealed.sha256)");
        assertThat(ContentLint.run(new String[]{"seal", archive.toString()})).isEqualTo(1);
        assertThat(ContentLint.run(new String[]{"check", repo.toString()})).isEqualTo(1);
    }

    @Test void symlinksAreRejected() throws Exception {
        Files.createSymbolicLink(repo.resolve("dts-docs/link.md"), repo.resolve("dts-worklog/spaces.yml"));
        assertThat(lint().errors()).containsExactly("dts-docs/link.md: symlinks are not allowed in content");
    }

    @Test void emptyTemplateManifestIsValid() throws Exception {
        write("dts-worklog/spaces.yml", "version: 1\nspaces: []\n");
        assertThat(lint().errors()).allMatch(e -> e.contains("space directory not declared"));
        assertThat(ContentLint.run(new String[]{"check"})).isEqualTo(1);
    }

    private ContentLint.Report lint() throws Exception {
        return new ContentLint().check(repo, ContentLint.DEFAULT_MANIFEST);
    }

    private void write(String path, String text) throws Exception {
        Path file = repo.resolve(path);
        Files.createDirectories(file.getParent());
        Files.writeString(file, text);
    }
}
