// Optional output isolation for machines where an IDE holds the normal build files open.
gradle.beforeProject {
    layout.buildDirectory.set(rootDir.resolve(".verify-build/$name"))
}
