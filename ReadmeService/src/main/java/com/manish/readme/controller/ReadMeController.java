package com.manish.readme.controller;

import com.manish.readme.dto.GeneralMessageResponseDTO;
import com.manish.readme.dto.GenerateReadmeRequestDTO;
import com.manish.readme.service.ReadMeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ReadMeController {
    private final ReadMeService readMeService;

    @PostMapping("/api/v1/readme")
    public ResponseEntity<String> generateReadme(@RequestBody GenerateReadmeRequestDTO generateReadmeRequestDTO) {
        log.info(" || called generateReadme in ReadMeController with {} ||", generateReadmeRequestDTO);
        return new ResponseEntity<>(readMeService.generateReadme(generateReadmeRequestDTO), HttpStatus.CREATED);
    }

    @GetMapping("/api/v1/health-check")
    public ResponseEntity<GeneralMessageResponseDTO> healthCheck() {
        log.info(" || called healthCheck in ReadMeController ||");
        return new ResponseEntity<>(new GeneralMessageResponseDTO("Read Me Service is running"), HttpStatus.OK);
    }
}
