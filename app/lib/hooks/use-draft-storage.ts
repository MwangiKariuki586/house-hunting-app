// Draft storage hook for VerifiedNyumba
// Manages localStorage persistence for listing draft with auto-save

"use client";

import * as React from "react";

const DRAFT_KEY = "listing-draft";
const DEBOUNCE_MS = 1000; // Save after 1 second of inactivity

export interface UploadedPhoto {
    url: string;
    publicId: string;
    isMain: boolean;
}

export interface ListingDraft<T> {
    formData: T;
    photos: UploadedPhoto[];
    currentStep: string;
    lastSaved: string; // ISO timestamp
}

export interface UseDraftStorageReturn<T> {
    /** Whether a draft exists in storage */
    hasDraft: boolean;
    /** The loaded draft data (null if none) */
    draft: ListingDraft<T> | null;
    /** Last saved timestamp */
    lastSaved: Date | null;
    /** Save draft to storage (debounced) */
    saveDraft: (data: Partial<ListingDraft<T>>) => void;
    /** Save draft immediately (no debounce) */
    saveDraftNow: (data: Partial<ListingDraft<T>>) => void;
    /** Clear draft from storage */
    clearDraft: () => void;
    /** Load draft from storage */
    loadDraft: () => ListingDraft<T> | null;
    /** Whether draft is currently being saved */
    isSaving: boolean;
}

/**
 * Hook for managing listing draft persistence in localStorage
 * Auto-saves form data with debouncing to prevent excessive writes
 */
export function useDraftStorage<T>(
    key: string = DRAFT_KEY
): UseDraftStorageReturn<T> {
    const [hasDraft, setHasDraft] = React.useState(false);
    const [draft, setDraft] = React.useState<ListingDraft<T> | null>(null);
    const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);

    const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);

    // Check for existing draft on mount
    React.useEffect(() => {
        const existingDraft = loadDraftFromStorage();
        if (existingDraft) {
            setHasDraft(true);
            setDraft(existingDraft);
            setLastSaved(new Date(existingDraft.lastSaved));
        }
    }, [key]);

    const loadDraftFromStorage = React.useCallback((): ListingDraft<T> | null => {
        if (typeof window === "undefined") return null;

        try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;

            const parsed = JSON.parse(stored) as ListingDraft<T>;
            return parsed;
        } catch (error) {
            console.error("Failed to load draft:", error);
            return null;
        }
    }, [key]);

    const saveDraftToStorage = React.useCallback(
        (data: Partial<ListingDraft<T>>) => {
            if (typeof window === "undefined") return;

            try {
                const existing = loadDraftFromStorage();
                const now = new Date().toISOString();

                const updated: ListingDraft<T> = {
                    formData: data.formData ?? existing?.formData ?? ({} as T),
                    photos: data.photos ?? existing?.photos ?? [],
                    currentStep: data.currentStep ?? existing?.currentStep ?? "basics",
                    lastSaved: now,
                };

                localStorage.setItem(key, JSON.stringify(updated));
                setHasDraft(true);
                setDraft(updated);
                setLastSaved(new Date(now));
                setIsSaving(false);
            } catch (error) {
                console.error("Failed to save draft:", error);
                setIsSaving(false);
            }
        },
        [key, loadDraftFromStorage]
    );

    const saveDraft = React.useCallback(
        (data: Partial<ListingDraft<T>>) => {
            setIsSaving(true);

            // Clear existing debounce timer
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            // Set new debounce timer
            debounceTimer.current = setTimeout(() => {
                saveDraftToStorage(data);
            }, DEBOUNCE_MS);
        },
        [saveDraftToStorage]
    );

    const saveDraftNow = React.useCallback(
        (data: Partial<ListingDraft<T>>) => {
            // Clear any pending debounced save
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            saveDraftToStorage(data);
        },
        [saveDraftToStorage]
    );

    const clearDraft = React.useCallback(() => {
        if (typeof window === "undefined") return;

        try {
            localStorage.removeItem(key);
            setHasDraft(false);
            setDraft(null);
            setLastSaved(null);
        } catch (error) {
            console.error("Failed to clear draft:", error);
        }
    }, [key]);

    const loadDraft = React.useCallback((): ListingDraft<T> | null => {
        return loadDraftFromStorage();
    }, [loadDraftFromStorage]);

    // Cleanup debounce timer on unmount
    React.useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    return {
        hasDraft,
        draft,
        lastSaved,
        saveDraft,
        saveDraftNow,
        clearDraft,
        loadDraft,
        isSaving,
    };
}

/**
 * Format relative time for "saved X ago" display
 */
export function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 5) return "just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return `${diffDay}d ago`;
}
