package com.manish.readme.service;

import com.manish.readme.dto.GenerateReadmeRequestDTO;
import com.manish.readme.exception.ApplicationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReadMeServiceTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient chatClient;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ResourceLoader resourceLoader;

    @InjectMocks
    private ReadMeService readMeService;

    @Test
    void generateReadme_Success() throws IOException {
        // Arrange
        String expectedPrompt = "Generated prompt";
        List<String> expectedStreamResponses = List.of(
                "First chunk",
                "Second chunk",
                "Final chunk"
        );
        String promptContent = "test prompt content";
        GenerateReadmeRequestDTO generateReadmeRequestDTO =
                new GenerateReadmeRequestDTO("abc", List.of("123"), List.of("sdsf"));

        ResponseEntity<String> mockResponseEntity = new ResponseEntity<>(expectedPrompt, HttpStatus.OK);

        Resource mockResource = mock(Resource.class);
        InputStream mockInputStream = new ByteArrayInputStream(promptContent.getBytes());
        when(mockResource.getInputStream()).thenReturn(mockInputStream);
        when(resourceLoader.getResource(anyString())).thenReturn(mockResource);

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)
        )).thenReturn(mockResponseEntity);

        ChatClient.ChatClientRequestSpec chatClientRequestSpec = mock(ChatClient.ChatClientRequestSpec.class);
        ChatClient.StreamResponseSpec streamResponseSpec = mock(ChatClient.StreamResponseSpec.class);

        when(chatClient.prompt(anyString())).thenReturn(chatClientRequestSpec);
        when(chatClientRequestSpec.stream()).thenReturn(streamResponseSpec);
        when(streamResponseSpec.content()).thenReturn(Flux.fromIterable(expectedStreamResponses));

        // Act and Assert
        StepVerifier.create(readMeService.generateReadme(generateReadmeRequestDTO))
                .expectNext("First chunk")
                .expectNext("Second chunk")
                .expectNext("Final chunk")
                .verifyComplete();
    }

    @Test
    void generateReadme_Error() {
        // Arrange
        GenerateReadmeRequestDTO generateReadmeRequestDTO =
                new GenerateReadmeRequestDTO("abc", List.of("123"), List.of("sdsf"));

        // Mock RestTemplate to throw an exception
        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(String.class)
        )).thenThrow(new RuntimeException("API Error"));

        // Act and Assert
        StepVerifier.create(readMeService.generateReadme(generateReadmeRequestDTO))
                .expectError(ApplicationException.class)
                .verify();
    }
}