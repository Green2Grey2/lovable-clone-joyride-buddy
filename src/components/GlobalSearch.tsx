import { useState, useEffect, useRef } from "react";
import { Search, X, FileText, Users, Trophy, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  type: 'media' | 'user' | 'achievement' | 'activity';
  title: string;
  description?: string;
  url?: string;
  icon?: any;
  metadata?: any;
}

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playClick } = useSoundEffects();
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(search);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search]);

  const performSearch = async (query: string) => {
    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search media content
      const { data: mediaData } = await supabase
        .from('editorial_media')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .eq('is_published', true)
        .limit(5);

      if (mediaData) {
        searchResults.push(...mediaData.map(item => ({
          id: item.id,
          type: 'media' as const,
          title: item.title,
          description: item.description,
          url: `/media`,
          icon: FileText,
          metadata: { category: item.category }
        })));
      }

      // Search users (if admin/manager)
      if (user) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .or(`name.ilike.%${query}%,department.ilike.%${query}%`)
          .limit(5);

        if (userData) {
          searchResults.push(...userData.map(profile => ({
            id: profile.id,
            type: 'user' as const,
            title: profile.name || 'Unknown User',
            description: profile.department,
            icon: Users,
            metadata: { userId: profile.user_id }
          })));
        }
      }

      // Search achievements
      const achievements = [
        { id: 'first-steps', name: 'First Steps', description: 'Log your first activity' },
        { id: 'week-warrior', name: 'Week Warrior', description: '7-day streak' },
        { id: 'century-club', name: 'Century Club', description: '100 total activities' },
        { id: 'marathon-milestone', name: 'Marathon Milestone', description: 'Walk 26.2 miles total' },
      ].filter(a => 
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase())
      );

      searchResults.push(...achievements.map(achievement => ({
        id: achievement.id,
        type: 'achievement' as const,
        title: achievement.name,
        description: achievement.description,
        url: '/awards',
        icon: Trophy
      })));

      // Search activities
      if (query.toLowerCase().includes('walk') || query.toLowerCase().includes('run') || 
          query.toLowerCase().includes('cycle') || query.toLowerCase().includes('workout')) {
        searchResults.push({
          id: 'log-activity',
          type: 'activity' as const,
          title: 'Log Activity',
          description: 'Track your fitness activity',
          url: '/activity',
          icon: Activity
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    playClick();
    setOpen(false);
    
    if (result.url) {
      navigate(result.url);
    }
    
    // Clear search after navigation
    setTimeout(() => setSearch(""), 100);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            <CommandInput
              placeholder="Search media, users, achievements..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? "Searching..." : "No results found."}
              </CommandEmpty>
              
              {results.filter(r => r.type === 'media').length > 0 && (
                <CommandGroup heading="Media & Articles">
                  {results.filter(r => r.type === 'media').map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <result.icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{result.title}</p>
                        {result.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {result.description}
                          </p>
                        )}
                      </div>
                      {result.metadata?.category && (
                        <Badge variant="secondary" className="text-xs">
                          {result.metadata.category}
                        </Badge>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {results.filter(r => r.type === 'user').length > 0 && (
                <CommandGroup heading="Users">
                  {results.filter(r => r.type === 'user').map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <result.icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{result.title}</p>
                        {result.description && (
                          <p className="text-sm text-muted-foreground">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {results.filter(r => r.type === 'achievement').length > 0 && (
                <CommandGroup heading="Achievements">
                  {results.filter(r => r.type === 'achievement').map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <result.icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{result.title}</p>
                        {result.description && (
                          <p className="text-sm text-muted-foreground">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {results.filter(r => r.type === 'activity').length > 0 && (
                <CommandGroup heading="Actions">
                  {results.filter(r => r.type === 'activity').map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <result.icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{result.title}</p>
                        {result.description && (
                          <p className="text-sm text-muted-foreground">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
};