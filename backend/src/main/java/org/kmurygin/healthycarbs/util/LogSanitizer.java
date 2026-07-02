package org.kmurygin.healthycarbs.util;

public final class LogSanitizer {

    private LogSanitizer() {
    }

    public static String clean(Object value) {
        if (value == null) {
            return null;
        }
        return value.toString().replace('\r', '_').replace('\n', '_');
    }
}
