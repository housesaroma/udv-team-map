import { z } from "zod";

const optionalString = z.preprocess(
  value => (value === null ? undefined : value),
  z.string().optional()
);

const optionalStringArray = z.preprocess(
  value => (value === null ? undefined : value),
  z.array(z.string()).optional()
);

const optionalContacts = z.preprocess(
  value => (value === null ? undefined : value),
  z
    .object({
      telegram: optionalStringArray,
      skype: optionalStringArray,
    })
    .optional()
);

type EmployeeNodeShape = {
  userId: string;
  userName: string;
  position: string;
  avatarUrl: string;
  subordinates: EmployeeNodeShape[];
  department?: string;
};

const employeeNodeSchema: z.ZodType<EmployeeNodeShape> = z.lazy(() =>
  z.object({
    userId: z.string().min(1),
    userName: z.string().min(1),
    position: z.string().min(1),
    avatarUrl: z.string(),
    subordinates: z.array(employeeNodeSchema),
    department: optionalString,
  })
);

export const apiUserProfileSchema = z.object({
  userId: z.string().min(1),
  userName: z.string().min(1),
  position: z.string().min(1),
  department: z.string().min(1),
  avatar: optionalString,
  phoneNumber: optionalString,
  city: optionalString,
  interests: optionalString,
  bornDate: optionalString,
  workExperience: optionalString,
  contacts: optionalContacts,
});

export const usersResponseSchema = z.object({
  amountOfUsers: z.number().int().nonnegative(),
  usersTable: z.array(apiUserProfileSchema),
  isCached: z.boolean(),
  currentPage: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
});

export const updateUserResponseSchema = apiUserProfileSchema.extend({
  bornDate: optionalString,
  workExperience: optionalString,
  phoneNumber: optionalString,
  city: optionalString,
  interests: optionalString,
  avatar: optionalString,
  contacts: optionalContacts,
});

export const stringArraySchema = z.array(z.string().min(1));

export const loginResponseSchema = z.object({
  token: z.string().min(1),
});

const departmentHierarchySchema = z.object({
  department: z.string().min(1),
  employees: z.array(employeeNodeSchema),
});

export const organizationHierarchySchema = z.object({
  ceo: employeeNodeSchema,
  departments: z.array(departmentHierarchySchema),
  totalEmployees: z.number().int().nonnegative(),
});

export type ApiUserProfile = z.infer<typeof apiUserProfileSchema>;
export type UsersResponse = z.infer<typeof usersResponseSchema>;
export type UpdateUserResponse = z.infer<typeof updateUserResponseSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type OrganizationHierarchyResponse = z.infer<
  typeof organizationHierarchySchema
>;
export type EmployeeNodeResponse = z.infer<typeof employeeNodeSchema>;
