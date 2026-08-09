package com.G9_LATAM_TEAM_58.techapi.common.util;

import java.nio.ByteBuffer;

public class VectorUtils {

    private VectorUtils() {
        // Utility class
    }

    public static byte[] toBytes(float[] floats) {
        if (floats == null) return null;
        ByteBuffer buffer = ByteBuffer.allocate(floats.length * 4);
        for (float f : floats) {
            buffer.putFloat(f);
        }
        return buffer.array();
    }

    public static float[] toFloats(byte[] bytes) {
        if (bytes == null) return null;
        ByteBuffer buffer = ByteBuffer.wrap(bytes);
        float[] floats = new float[bytes.length / 4];
        for (int i = 0; i < floats.length; i++) {
            floats[i] = buffer.getFloat();
        }
        return floats;
    }

    public static String toVectorString(float[] floats) {
        if (floats == null) return null;
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < floats.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(floats[i]);
        }
        return sb.append("]").toString();
    }
}
