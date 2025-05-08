package com.manish.readme.service;

import com.manish.readme.dto.GenerateReadmeRequestDTO;
import com.manish.readme.exception.ApplicationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReadMeService {
    private final ChatClient chatClient;
    private final RestTemplate restTemplate;
    private final ResourceLoader resourceLoader;

    public String generateReadme(GenerateReadmeRequestDTO generateReadmeRequestDTO) {
        log.info(" || called generateReadme in ReadMeService with {} ||", generateReadmeRequestDTO);

        String url = "http://prompt-service:9010/api/v1/prompt/prompt-compact";
        ResponseEntity<String> promptResponseEntity;

        try {
            promptResponseEntity = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(generateReadmeRequestDTO), String.class);

            if(promptResponseEntity == null) {
                throw new ApplicationException("Something went wrong 1");
            }

            if(!promptResponseEntity.getStatusCode().is2xxSuccessful()) {
                throw new ApplicationException("Something went wrong 2");
            }
        } catch (Exception e) {
            throw new ApplicationException(e.getMessage());
        }

        String customPromptContent = "";

        Resource resource = resourceLoader.getResource("classpath:prompt.md");
        try (InputStream inputStream = resource.getInputStream()) {
            customPromptContent = new String(inputStream.readAllBytes());
        } catch (IOException e) {
            throw new ApplicationException(e.getMessage());
        }

        return chatClient.prompt(Objects.requireNonNull(promptResponseEntity.getBody()) + customPromptContent)
                .call()
                .content();
    }
}
