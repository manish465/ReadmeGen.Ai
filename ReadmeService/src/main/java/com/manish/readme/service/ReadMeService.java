package com.manish.readme.service;

import com.manish.readme.dto.GenerateReadmeRequestDTO;
import com.manish.readme.exception.ApplicationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReadMeService {
    private final ChatClient chatClient;
    private final RestTemplate restTemplate;

    public String generateReadme(GenerateReadmeRequestDTO generateReadmeRequestDTO) {
        log.info(" || called generateReadme in ReadMeService with {} ||", generateReadmeRequestDTO);

        String url = "http://prompt-service/api/v1/prompt/prompt";
        ResponseEntity<String> promptResponseEntity;

        try {
            promptResponseEntity = restTemplate.postForObject(url, generateReadmeRequestDTO, ResponseEntity.class);

            if(promptResponseEntity == null) {
                throw new ApplicationException("Something went wrong");
            }

            if(!promptResponseEntity.getStatusCode().is2xxSuccessful()) {
                throw new ApplicationException("Something went wrong");
            }
        } catch (Exception e) {
            throw new ApplicationException("Something went wrong");
        }


        return chatClient.prompt(Objects.requireNonNull(promptResponseEntity.getBody()))
                .call()
                .content();
    }
}
