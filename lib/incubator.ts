// Configuration, templates and progress calculation for Launch Lab 21 Incubator

export interface ModuleField {
  id: string;
  labelKey: string;
  helpKey: string;
  placeholderKey: string;
  exampleKey: string;
  required?: boolean;
}

export interface IncubatorModuleConfig {
  id: string;
  order: number;
  titleKey: string;
  descKey: string;
  badgeKey: string;
  fields: ModuleField[];
}

export const INCUBATOR_MODULES: IncubatorModuleConfig[] = [
  {
    id: "problem",
    order: 1,
    titleKey: "incubator.mod_problem_title",
    descKey: "incubator.mod_problem_desc",
    badgeKey: "incubator.mod_problem_badge",
    fields: [
      {
        id: "target_user",
        labelKey: "incubator.field_target_user_label",
        helpKey: "incubator.field_target_user_help",
        placeholderKey: "incubator.field_target_user_placeholder",
        exampleKey: "incubator.field_target_user_example",
        required: true,
      },
      {
        id: "problem_statement",
        labelKey: "incubator.field_problem_statement_label",
        helpKey: "incubator.field_problem_statement_help",
        placeholderKey: "incubator.field_problem_statement_placeholder",
        exampleKey: "incubator.field_problem_statement_example",
        required: true,
      },
      {
        id: "current_solutions",
        labelKey: "incubator.field_current_solutions_label",
        helpKey: "incubator.field_current_solutions_help",
        placeholderKey: "incubator.field_current_solutions_placeholder",
        exampleKey: "incubator.field_current_solutions_example",
        required: true,
      },
    ],
  },
  {
    id: "customer",
    order: 2,
    titleKey: "incubator.mod_customer_title",
    descKey: "incubator.mod_customer_desc",
    badgeKey: "incubator.mod_customer_badge",
    fields: [
      {
        id: "target_segment",
        labelKey: "incubator.field_target_segment_label",
        helpKey: "incubator.field_target_segment_help",
        placeholderKey: "incubator.field_target_segment_placeholder",
        exampleKey: "incubator.field_target_segment_example",
        required: true,
      },
      {
        id: "customer_need",
        labelKey: "incubator.field_customer_need_label",
        helpKey: "incubator.field_customer_need_help",
        placeholderKey: "incubator.field_customer_need_placeholder",
        exampleKey: "incubator.field_customer_need_example",
        required: true,
      },
      {
        id: "validation_method",
        labelKey: "incubator.field_validation_method_label",
        helpKey: "incubator.field_validation_method_help",
        placeholderKey: "incubator.field_validation_method_placeholder",
        exampleKey: "incubator.field_validation_method_example",
        required: true,
      },
    ],
  },
  {
    id: "solution",
    order: 3,
    titleKey: "incubator.mod_solution_title",
    descKey: "incubator.mod_solution_desc",
    badgeKey: "incubator.mod_solution_badge",
    fields: [
      {
        id: "solution_overview",
        labelKey: "incubator.field_solution_overview_label",
        helpKey: "incubator.field_solution_overview_help",
        placeholderKey: "incubator.field_solution_overview_placeholder",
        exampleKey: "incubator.field_solution_overview_example",
        required: true,
      },
      {
        id: "core_benefit",
        labelKey: "incubator.field_core_benefit_label",
        helpKey: "incubator.field_core_benefit_help",
        placeholderKey: "incubator.field_core_benefit_placeholder",
        exampleKey: "incubator.field_core_benefit_example",
        required: true,
      },
      {
        id: "unfair_advantage",
        labelKey: "incubator.field_unfair_advantage_label",
        helpKey: "incubator.field_unfair_advantage_help",
        placeholderKey: "incubator.field_unfair_advantage_placeholder",
        exampleKey: "incubator.field_unfair_advantage_example",
        required: true,
      },
    ],
  },
  {
    id: "mvp",
    order: 4,
    titleKey: "incubator.mod_mvp_title",
    descKey: "incubator.mod_mvp_desc",
    badgeKey: "incubator.mod_mvp_badge",
    fields: [
      {
        id: "core_features",
        labelKey: "incubator.field_core_features_label",
        helpKey: "incubator.field_core_features_help",
        placeholderKey: "incubator.field_core_features_placeholder",
        exampleKey: "incubator.field_core_features_example",
        required: true,
      },
      {
        id: "test_plan",
        labelKey: "incubator.field_test_plan_label",
        helpKey: "incubator.field_test_plan_help",
        placeholderKey: "incubator.field_test_plan_placeholder",
        exampleKey: "incubator.field_test_plan_example",
        required: true,
      },
      {
        id: "success_metrics",
        labelKey: "incubator.field_success_metrics_label",
        helpKey: "incubator.field_success_metrics_help",
        placeholderKey: "incubator.field_success_metrics_placeholder",
        exampleKey: "incubator.field_success_metrics_example",
        required: true,
      },
    ],
  },
  {
    id: "gtm",
    order: 5,
    titleKey: "incubator.mod_gtm_title",
    descKey: "incubator.mod_gtm_desc",
    badgeKey: "incubator.mod_gtm_badge",
    fields: [
      {
        id: "early_adopters",
        labelKey: "incubator.field_early_adopters_label",
        helpKey: "incubator.field_early_adopters_help",
        placeholderKey: "incubator.field_early_adopters_placeholder",
        exampleKey: "incubator.field_early_adopters_example",
        required: true,
      },
      {
        id: "distribution_channels",
        labelKey: "incubator.field_distribution_channels_label",
        helpKey: "incubator.field_distribution_channels_help",
        placeholderKey: "incubator.field_distribution_channels_placeholder",
        exampleKey: "incubator.field_distribution_channels_example",
        required: true,
      },
      {
        id: "business_model",
        labelKey: "incubator.field_business_model_label",
        helpKey: "incubator.field_business_model_help",
        placeholderKey: "incubator.field_business_model_placeholder",
        exampleKey: "incubator.field_business_model_example",
        required: true,
      },
    ],
  },
  {
    id: "team",
    order: 6,
    titleKey: "incubator.mod_team_title",
    descKey: "incubator.mod_team_desc",
    badgeKey: "incubator.mod_team_badge",
    fields: [
      {
        id: "team_roles",
        labelKey: "incubator.field_team_roles_label",
        helpKey: "incubator.field_team_roles_help",
        placeholderKey: "incubator.field_team_roles_placeholder",
        exampleKey: "incubator.field_team_roles_example",
        required: true,
      },
      {
        id: "missing_skills",
        labelKey: "incubator.field_missing_skills_label",
        helpKey: "incubator.field_missing_skills_help",
        placeholderKey: "incubator.field_missing_skills_placeholder",
        exampleKey: "incubator.field_missing_skills_example",
        required: false,
      },
      {
        id: "next_milestones",
        labelKey: "incubator.field_next_milestones_label",
        helpKey: "incubator.field_next_milestones_help",
        placeholderKey: "incubator.field_next_milestones_placeholder",
        exampleKey: "incubator.field_next_milestones_example",
        required: true,
      },
    ],
  },
];

export interface ProgressSummary {
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
  statusText: string;
  completedModuleIds: string[];
  currentModuleId: string | null;
}

export function calculateProgress(
  submissions:
    | { moduleId: string; status: string }[]
    | Record<string, { status: string }>
    | undefined
    | null
): ProgressSummary {
  const total = INCUBATOR_MODULES.length; // 6

  const subList: { moduleId: string; status: string }[] = Array.isArray(submissions)
    ? submissions
    : submissions
    ? Object.entries(submissions).map(([moduleId, val]) => ({
        moduleId,
        status: val?.status || "",
      }))
    : [];

  // Only submitted answers count as completed
  const completedModuleIds = Array.from(
    new Set(
      subList
        .filter((s) => s.status === "submitted")
        .map((s) => s.moduleId)
    )
  );

  const completed = completedModuleIds.length;
  const remaining = Math.max(0, total - completed);
  const percentage = Math.round((completed / total) * 100);

  // Find the first unsubmitted module in sequence
  let currentModuleId: string | null = null;
  for (const mod of INCUBATOR_MODULES) {
    if (!completedModuleIds.includes(mod.id)) {
      currentModuleId = mod.id;
      break;
    }
  }

  const statusText = `${completed}/${total} bajarildi · ${remaining} ta qoldi · ${percentage}%`;

  return {
    total,
    completed,
    remaining,
    percentage,
    statusText,
    completedModuleIds,
    currentModuleId,
  };
}

export function getModuleConfig(moduleId: string): IncubatorModuleConfig | undefined {
  return INCUBATOR_MODULES.find((m) => m.id === moduleId);
}
