package com.G9_LATAM_TEAM_58.techapi.inference.controller;

import com.G9_LATAM_TEAM_58.techapi.inference.dto.ModelResponse;
import com.G9_LATAM_TEAM_58.techapi.inference.service.IModelService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/model")
public class ModelController {

    private final IModelService modelService;

    public ModelController(IModelService modelService) {
        this.modelService = modelService;
    }

    @GetMapping
    public ModelResponse getModelInfo() {
        return modelService.getModelInfo();
    }
}
