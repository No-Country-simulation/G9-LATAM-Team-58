package com.G9_LATAM_TEAM_58.techapi.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentRepository extends JpaRepository<Content, String> {

    // Standard JPA derived queries
    Page<Content> findAllByCategory(String category, Pageable pageable);

    // Native queries for embedding + vector operations

    @Query(value = "SELECT embedding FROM contents WHERE id = :id", nativeQuery = true)
    byte[] findEmbeddingById(@Param("id") String id);

    @Query(value = """
        SELECT id, title, category,
               1 - VECTOR_DISTANCE(embedding, :sourceEmbedding, COSINE) AS similarity
        FROM contents
        WHERE id <> :baseId
        ORDER BY VECTOR_DISTANCE(embedding, :sourceEmbedding, COSINE)
        FETCH FIRST :limit ROWS ONLY
    """, nativeQuery = true)
    List<Object[]> findRelatedContents(
            @Param("sourceEmbedding") byte[] sourceEmbedding,
            @Param("baseId") String baseId,
            @Param("limit") int limit
    );

    @Query(value = """
        SELECT id, title, category,
               1 - VECTOR_DISTANCE(embedding, :queryEmbedding, COSINE) AS similarity
        FROM contents
        ORDER BY VECTOR_DISTANCE(embedding, :queryEmbedding, COSINE)
        OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    """, nativeQuery = true)
    List<Object[]> semanticSearch(
            @Param("queryEmbedding") byte[] queryEmbedding,
            @Param("offset") int offset,
            @Param("limit") int limit
    );

    @Query(value = """
        SELECT id, title, category,
               1 - VECTOR_DISTANCE(embedding, :queryEmbedding, COSINE) AS similarity
        FROM contents
        WHERE category = :category
        ORDER BY VECTOR_DISTANCE(embedding, :queryEmbedding, COSINE)
        OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    """, nativeQuery = true)
    List<Object[]> semanticSearchWithCategory(
            @Param("queryEmbedding") byte[] queryEmbedding,
            @Param("category") String category,
            @Param("offset") int offset,
            @Param("limit") int limit
    );

    @Query(value = "SELECT id, title, category FROM contents WHERE title LIKE %:q% OR body LIKE %:q%",
            countQuery = "SELECT COUNT(*) FROM contents WHERE title LIKE %:q% OR body LIKE %:q%",
            nativeQuery = true)
    Page<Object[]> keywordSearch(@Param("q") String q, Pageable pageable);

    @Query(value = """
        SELECT id, title, category, x, y
        FROM contents
        WHERE x IS NOT NULL AND y IS NOT NULL
    """, nativeQuery = true)
    List<Object[]> findMapPoints();

    @Query(value = "SELECT category, COUNT(*) FROM contents WHERE category IS NOT NULL GROUP BY category", nativeQuery = true)
    List<Object[]> countByCategory();

    @Query(value = "SELECT COUNT(*) FROM contents WHERE added_at >= TRUNC(SYSDATE, 'IW')", nativeQuery = true)
    long findAddedThisWeek();
}
