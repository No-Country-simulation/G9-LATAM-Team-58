package com.G9_LATAM_TEAM_58.techapi.unit.controller;

import com.G9_LATAM_TEAM_58.techapi.core.controller.MapController;
import com.G9_LATAM_TEAM_58.techapi.core.dto.MapPoint;
import com.G9_LATAM_TEAM_58.techapi.core.service.IMapService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MapController.class)
class MapControllerUnitTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private IMapService mapService;

    @Test
    void test200Empty() throws Exception {
        when(mapService.getMapPoints()).thenReturn(List.of());

        mvc.perform(get("/map"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void test200WithPoints() throws Exception {
        MapPoint point = new MapPoint();
        point.setId("p1");
        point.setTitle("Punto 1");
        point.setCategory("java");
        point.setX(0.1);
        point.setY(-0.2);

        when(mapService.getMapPoints()).thenReturn(List.of(point));

        mvc.perform(get("/map"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value("p1"))
                .andExpect(jsonPath("$[0].category").value("java"));
    }
}
