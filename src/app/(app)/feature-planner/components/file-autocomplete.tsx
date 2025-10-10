'use client';

import { FileCode, Plus, Search, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface FileAutocompleteProps {
  onFileAdded: (file: {
    description: string;
    filePath: string;
    priority: 'critical' | 'high' | 'low' | 'medium';
  }) => void;
}

export const FileAutocomplete = ({ onFileAdded }: FileAutocompleteProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'critical' | 'high' | 'low' | 'medium'>('medium');

  // Debounced search function
  const searchFiles = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/feature-planner/files/search?q=${encodeURIComponent(searchQuery)}`);
      const data = (await response.json()) as { files: string[] };

      if (response.ok) {
        setSuggestions(data.files || []);
      } else {
        toast.error('Failed to search files');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('File search error:', error);
      toast.error('An error occurred while searching');
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      void searchFiles(value);
    },
    [searchFiles],
  );

  const handleSelectFile = useCallback((file: string) => {
    setSelectedFile(file);
    setQuery(file);
    setSuggestions([]);
  }, []);

  const handleAddFile = useCallback(() => {
    if (!selectedFile || !description.trim()) {
      toast.error('Please select a file and provide a description');
      return;
    }

    onFileAdded({
      description: description.trim(),
      filePath: selectedFile,
      priority,
    });

    // Reset form
    setSelectedFile('');
    setQuery('');
    setDescription('');
    setPriority('medium');
    setSuggestions([]);

    toast.success('File added successfully');
  }, [selectedFile, description, priority, onFileAdded]);

  const handleClearSelection = useCallback(() => {
    setSelectedFile('');
    setQuery('');
    setSuggestions([]);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <FileCode className={'size-5'} />
          Add File Manually
        </CardTitle>
        <CardDescription>Search and add relevant files to the discovery results</CardDescription>
      </CardHeader>
      <CardContent className={'space-y-4'}>
        {/* File Search */}
        <div className={'space-y-2'}>
          <Label htmlFor={'file-search'}>File Path</Label>
          <div className={'relative'}>
            <Search className={'absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'} />
            <Input
              className={'pr-9 pl-9'}
              id={'file-search'}
              onChange={(e) => {
                handleQueryChange(e.target.value);
              }}
              placeholder={'Search for files (e.g., src/components)'}
              value={query}
            />
            {selectedFile && (
              <Button
                className={'absolute top-1/2 right-1 size-7 -translate-y-1/2'}
                onClick={handleClearSelection}
                size={'icon'}
                variant={'ghost'}
              >
                <X className={'size-4'} />
              </Button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className={'max-h-48 overflow-y-auto rounded-md border bg-popover'}>
              {suggestions.map((file) => (
                <button
                  className={
                    'w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground'
                  }
                  key={file}
                  onClick={() => {
                    handleSelectFile(file);
                  }}
                  type={'button'}
                >
                  {file}
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <p className={'text-xs text-muted-foreground'}>Searching...</p>
          )}

          {/* Selected File Badge */}
          {selectedFile && (
            <Badge className={'gap-1'} variant={'secondary'}>
              <FileCode className={'size-3'} />
              {selectedFile}
            </Badge>
          )}
        </div>

        {/* Priority Selection */}
        <div className={'space-y-2'}>
          <Label htmlFor={'priority'}>Priority</Label>
          <Select
            onValueChange={(value: 'critical' | 'high' | 'low' | 'medium') => {
              setPriority(value);
            }}
            value={priority}
          >
            <SelectTrigger id={'priority'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={'critical'}>Critical</SelectItem>
              <SelectItem value={'high'}>High</SelectItem>
              <SelectItem value={'medium'}>Medium</SelectItem>
              <SelectItem value={'low'}>Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className={'space-y-2'}>
          <Label htmlFor={'description'}>Description</Label>
          <Textarea
            id={'description'}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            placeholder={'Why is this file relevant to the feature?'}
            rows={3}
            value={description}
          />
        </div>

        {/* Add Button */}
        <Button className={'w-full'} disabled={!selectedFile || !description.trim()} onClick={handleAddFile}>
          <Plus className={'mr-2 size-4'} />
          Add File to Discovery
        </Button>
      </CardContent>
    </Card>
  );
};
