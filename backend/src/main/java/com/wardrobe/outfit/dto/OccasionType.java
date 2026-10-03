package com.wardrobe.outfit.dto;

public enum OccasionType {
    CASUAL,
    FORMAL,
    WORK,
    PARTY,
    SUMMER,
    WINTER,
    MINIMAL,
    LOUNGEWEAR,
    ACTIVEWEAR;

    public static OccasionType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return CASUAL;
        }
        try {
            return OccasionType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return CASUAL;
        }
    }
}
