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
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.InputStream;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReadMeService {
    private final ChatClient chatClient;
    private final RestTemplate restTemplate;
    private final ResourceLoader resourceLoader;

    public Flux<String> generateReadme(GenerateReadmeRequestDTO generateReadmeRequestDTO) {
        log.info(" || called generateReadme in ReadMeService with {} ||", generateReadmeRequestDTO);

        return Mono.fromCallable(() -> {
                    String url = "http://prompt-service:9010/api/v1/prompt/prompt-compact";
                    ResponseEntity<String> promptResponseEntity;

                    try {
                        promptResponseEntity = restTemplate.exchange(
                                url,
                                HttpMethod.POST,
                                new HttpEntity<>(generateReadmeRequestDTO),
                                String.class
                        );

                        if (!promptResponseEntity.getStatusCode().is2xxSuccessful()) {
                            throw new ApplicationException("Failed to get prompt: " + promptResponseEntity.getStatusCode());
                        }

                        Resource resource = resourceLoader.getResource("classpath:prompt.md");
                        String customPromptContent;
                        try (InputStream inputStream = resource.getInputStream()) {
                            customPromptContent = new String(inputStream.readAllBytes());
                        }

                        return Objects.requireNonNull(promptResponseEntity.getBody()) + customPromptContent;
                    } catch (Exception e) {
                        throw new ApplicationException(e.getMessage());
                    }
                })
                .flatMapMany(prompt -> chatClient.prompt(prompt)
                        .stream()
                        .content()
                        .onErrorMap(e -> new ApplicationException("Error in AI response: " + e.getMessage()))
                )
                .onErrorMap(e -> e instanceof ApplicationException ? e : new ApplicationException(e.getMessage()));
    }
}