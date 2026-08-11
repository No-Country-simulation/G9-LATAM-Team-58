package com.G9_LATAM_TEAM_58.techapi.unit.service;

import com.G9_LATAM_TEAM_58.techapi.common.dto.SearchResponse;
import com.G9_LATAM_TEAM_58.techapi.core.service.impl.KeywordSearchServiceImpl;
import com.G9_LATAM_TEAM_58.techapi.domain.ContentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class KeywordSearchServiceImplUnitTest {

    @Test
    void totalReflectsAllMatchingElementsAcrossPages() {
        ContentRepository contentRepository = mock(ContentRepository.class);
        KeywordSearchServiceImpl service = new KeywordSearchServiceImpl(contentRepository);

        Object[] row1 = {"id-1", "title-1", "cat-1"};
        Object[] row2 = {"id-2", "title-2", "cat-2"};
        List<Object[]> content = List.of(row1, row2);
        Page<Object[]> page = new PageImpl<>(content, PageRequest.of(0, 2), 42);

        when(contentRepository.keywordSearch(eq("test"), any(PageRequest.class))).thenReturn(page);

        SearchResponse response = service.search("test", null, 0, 2);

        // Regression guard: total must be the full match count (42), not the page size (2).
        assertEquals(42, response.getTotal());
        assertEquals(2, response.getResults().size());
        assertEquals("keyword", response.getMode());
    }

    @Test
    void categoryFilterUsesDedicatedQueryAndCorrectTotal() {
        ContentRepository contentRepository = mock(ContentRepository.class);
        KeywordSearchServiceImpl service = new KeywordSearchServiceImpl(contentRepository);

        Object[] row1 = {"id-1", "title-1", "Backend"};
        Page<Object[]> page = new PageImpl<>(List.<Object[]>of(row1), PageRequest.of(0, 2), 7);

        when(contentRepository.keywordSearchWithCategory(eq("test"), eq("Backend"), any(PageRequest.class)))
                .thenReturn(page);

        SearchResponse response = service.search("test", "Backend", 0, 2);

        // Regression guard: category must route to keywordSearchWithCategory, not be
        // concatenated into the free-text query, so total reflects real matches in-category.
        assertEquals(7, response.getTotal());
        assertEquals(1, response.getResults().size());
    }
}
