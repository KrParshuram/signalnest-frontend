export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  organizations: {
    all: ["organizations"] as const,
    list: () => [...queryKeys.organizations.all, "list"] as const,
    detail: (organizationId: string) => [...queryKeys.organizations.all, organizationId] as const,
  },
  brands: {
    all: ["brands"] as const,
    list: (organizationId: string) => [...queryKeys.brands.all, organizationId] as const,
    detail: (organizationId: string, brandId: string) =>
      [...queryKeys.brands.all, organizationId, brandId] as const,
  },
  topics: {
    all: ["topics"] as const,
    list: (organizationId: string) => [...queryKeys.topics.all, organizationId] as const,
  },
  imports: {
    all: ["imports"] as const,
    detail: (jobId: string) => [...queryKeys.imports.all, jobId] as const,
  },
  feedback: {
    all: ["feedback"] as const,
    list: (organizationId: string, brandId: string | null, filters: unknown) =>
      [...queryKeys.feedback.all, organizationId, brandId ?? "all-brands", "list", filters] as const,
    detail: (organizationId: string, feedbackId: string) =>
      [...queryKeys.feedback.all, organizationId, "detail", feedbackId] as const,
  },
} as const;
