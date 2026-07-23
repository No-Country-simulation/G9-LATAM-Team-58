package com.G9_LATAM_TEAM_58.techapi.inference.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class EmbedRequest {
    private String text;
    private String type;

    public EmbedRequest() {}

    public EmbedRequest(String text, String type) {
        this.text = text;
        this.type = type;
    }
}
