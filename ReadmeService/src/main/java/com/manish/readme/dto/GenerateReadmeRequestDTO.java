package com.manish.readme.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateReadmeRequestDTO {
    private String repo;
    private List<String> filePaths;
    private List<String> customCommands;
}
