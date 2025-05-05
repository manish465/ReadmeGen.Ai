package com.manish.readme.service;

import com.manish.readme.dto.GenerateReadmeRequestDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReadMeServiceTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient chatClient;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private ReadMeService readMeService;

    @Test
    void generateReadme_Success() {
        // Arrange
        String expectedPrompt = "Generated prompt";
        String expectedAiResponse = "AI generated README";
        GenerateReadmeRequestDTO generateReadmeRequestDTO =
                new GenerateReadmeRequestDTO("abc", List.of("123"), List.of("sdsf"));

        ResponseEntity<String> mockResponseEntity = new ResponseEntity<>(expectedPrompt, HttpStatus.OK);

        ChatClient.ChatClientRequestSpec chatClientRequestSpec = mock(ChatClient.ChatClientRequestSpec.class);
        ChatClient.CallResponseSpec callResponseSpec = mock(ChatClient.CallResponseSpec.class);


        when(restTemplate.postForObject(anyString(), any(), any()))
                .thenReturn(mockResponseEntity);

        when(chatClient.prompt(anyString())).thenReturn(chatClientRequestSpec);
        when(chatClientRequestSpec.call()).thenReturn(callResponseSpec);
        when(callResponseSpec.content()).thenReturn(expectedAiResponse);

        // Act
        String actualResult = readMeService.generateReadme(generateReadmeRequestDTO);

        // Assert
        assertEquals(expectedAiResponse, actualResult);
    }
}
