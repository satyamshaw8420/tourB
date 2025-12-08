import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveTrip = mutation({
  args: {
    userSelection: v.object({
      location: v.object({
        label: v.string()
      }),
      travelers: v.union(v.number(), v.null()),
      days: v.string(),
      budget: v.union(v.number(), v.null()),
      // Optional fields that might be present
      numberOfMembers: v.optional(v.number()),
      startDate: v.optional(v.string()),
    }),
    tripData: v.any(),
    userEmail: v.optional(v.string()),
    userId: v.optional(v.string()),
    userInformation: v.optional(v.object({
      userId: v.string(),
      userEmail: v.string(),
      timestamp: v.number(),
      userAgent: v.string(),
    })),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const tripId = await ctx.db.insert("trips", {
      userSelection: args.userSelection,
      tripData: args.tripData,
      userEmail: args.userEmail,
      userId: args.userId,
      userInformation: args.userInformation,
      createdAt: args.createdAt,
      shareId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Generate unique share ID
    });
    
    return tripId;
  },
});

export const updateTripShareId = mutation({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    // Generate a unique share ID
    const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Update the trip with the share ID
    await ctx.db.patch(args.tripId, {
      shareId: shareId
    });
    
    return shareId;
  },
});

// Function to update trip details
export const updateTrip = mutation({
  args: {
    tripId: v.id("trips"),
    userSelection: v.object({
      location: v.object({
        label: v.string()
      }),
      travelers: v.union(v.number(), v.null()),
      days: v.string(),
      budget: v.union(v.number(), v.null()),
      // Optional fields that might be present
      numberOfMembers: v.optional(v.number()),
      startDate: v.optional(v.string()),
    }),
    tripData: v.any(),
  },
  handler: async (ctx, args) => {
    // Update the trip with new data
    await ctx.db.patch(args.tripId, {
      userSelection: args.userSelection,
      tripData: args.tripData,
      updatedAt: Date.now(),
    });
    
    return args.tripId;
  },
});

// Function to delete a trip
export const deleteTrip = mutation({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    // Delete the trip from the database
    await ctx.db.delete(args.tripId);
    
    return args.tripId;
  },
});
