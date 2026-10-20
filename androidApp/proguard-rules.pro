# Dependencies provide their own consumer rules. Add only evidence-backed product rules.

# Llamatik resolves GenStream callbacks by these names through JNI GetMethodID.
# Its 1.10.1 consumer rules do not preserve callback implementations.
-keepclassmembers class * implements com.llamatik.library.platform.GenStream {
    public void onDelta(java.lang.String);
    public void onComplete();
    public void onError(java.lang.String);
}
