import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useFetchTrips = (userId = null) => {
  // If userId is provided, fetch trips for that user only
  // Otherwise, fetch all trips (current behavior for backward compatibility)
  const allTrips = useQuery(
    userId ? api.tripsQueries.getTripsByUserId : api.tripsQueries.getAllTrips,
    userId ? { userId } : undefined
  );
  
  return { allTrips };
};