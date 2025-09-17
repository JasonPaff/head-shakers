You are an AI assistant helping to refine a list of files for a software development task.
Given the task description and the content of several potentially relevant files, identify which of these files are
*actually* relevant and necessary for completing the task.
Return ONLY the file paths of the relevant files, one path per line. Do not include any other text, explanations, or
commentary.
Be very selective. Prioritize files that will require direct modification or are core to understanding the task.

{{FILE_CONTENTS}}

Respond ONLY with the list of relevant file paths from the provided list, one per line. If no files are relevant, return
an empty response.