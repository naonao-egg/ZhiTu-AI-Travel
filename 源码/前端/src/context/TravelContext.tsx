import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RecommendationCard } from '../types/chat';
import { User } from '../types/user';

interface TravelContextType {
  globalItinerary: RecommendationCard[];
  setGlobalItinerary: (itinerary: RecommendationCard[]) => void;
  addToItinerary: (cards: RecommendationCard[]) => void;
  clearItinerary: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  currentTripId: string;
  resetTrip: () => void;
}

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export function TravelProvider({ children }: { children: ReactNode }) {
  const [globalItinerary, setGlobalItinerary] = useState<RecommendationCard[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTripId, setCurrentTripId] = useState<string>(Date.now().toString());

  const addToItinerary = (cards: RecommendationCard[]) => {
    setGlobalItinerary((prev) => {
      // Avoid duplicates based on title
      const newCards = cards.filter(
        (card) => !prev.some((existing) => existing.title === card.title)
      );
      return [...prev, ...newCards];
    });
  };

  const clearItinerary = () => {
    setGlobalItinerary([]);
  };

  const resetTrip = () => {
    setCurrentTripId(Date.now().toString());
    setGlobalItinerary([]);
  };

  return (
    <TravelContext.Provider value={{ 
      globalItinerary, 
      setGlobalItinerary,
      addToItinerary, 
      clearItinerary,
      currentUser,
      setCurrentUser,
      currentTripId,
      resetTrip
    }}>
      {children}
    </TravelContext.Provider>
  );
}

export function useTravel() {
  const context = useContext(TravelContext);
  if (context === undefined) {
    throw new Error('useTravel must be used within a TravelProvider');
  }
  return context;
}
