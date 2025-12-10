import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Force full redeployment: 2025-12-09 18:00
// Explicitly defining needGuide field in schema with comment

export default defineSchema({
  // Main trips table storing all trip information
  trips: defineTable({
    // User selection data from the trip creation form
    userSelection: v.object({
      location: v.object({
        label: v.string()
      }),
      travelers: v.union(v.number(), v.null()),
      days: v.string(),
      budget: v.union(v.number(), v.null()),
      // Add needGuide field to the schema with explicit validation
      // This field indicates whether the user wants to hire a local guide
      needGuide: v.optional(v.boolean()),
      // Add customBudget field to store manual budget input
      customBudget: v.optional(v.string()),
      // Additional fields that may be present
      numberOfMembers: v.optional(v.number()),
      startDate: v.optional(v.string()),
    }),
    
    // AI-generated trip data
    tripData: v.any(),
    
    // User identification and contact information
    userEmail: v.optional(v.string()),
    userId: v.optional(v.string()),
    
    // Comprehensive user information for analytics
    userInformation: v.optional(v.object({
      userId: v.string(),
      userEmail: v.string(),
      timestamp: v.number(),
      userAgent: v.string(),
    })),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    
    // Sharing functionality
    shareId: v.optional(v.string()),
  }).index("by_user", ["userId"]),
  
  // Optional: User profiles table for future expansion
  // This could be added if we want to store persistent user preferences
  /*
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    profilePicture: v.optional(v.string()),
    preferences: v.optional(v.object({
      defaultBudget: v.optional(v.string()),
      defaultTravelers: v.optional(v.number()),
      notifications: v.optional(v.boolean()),
    })),
    createdAt: v.number(),
    lastLoginAt: v.number(),
  }).index("by_email", ["email"]),
  */
  
  // Optional: Trip feedback/reviews table for future expansion
  /*
  tripFeedback: defineTable({
    tripId: v.id("trips"),
    userId: v.string(),
    rating: v.number(),
    review: v.string(),
    createdAt: v.number(),
  }).index("by_trip", ["tripId"]).index("by_user", ["userId"]),
  */
});