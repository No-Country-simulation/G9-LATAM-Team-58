package com.G9_LATAM_TEAM_58.techapi.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "contents")
@Getter @Setter
public class Content {

    @Id
    @Column(length = 100)
    private String id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, columnDefinition = "CLOB")
    private String body;

    @Column(length = 50)
    private String category;

    private Double probability;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "CLOB")
    private List<String> keywords;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "CLOB")
    private List<String> explanation;

    private Integer clusterId;

    private Float x;

    private Float y;

    @Column(length = 100)
    private String source;

    @Column(length = 1000)
    private String url;

    @Column(length = 10)
    private String language;

    @Column(name = "added_at")
    private Instant addedAt;
}
