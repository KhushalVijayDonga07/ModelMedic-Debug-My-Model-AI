import { z } from "zod";

export type Issue = {
  id: string;
  name: string;
  confidence: number;
  description: string;
  evidence: string;
};

export type Fix = {
  issueId: string;
  title: string;
  explanation: string;
  codeSnippet: string;
  language: string;
};

export type DiagnosisInput = {
  modelArchitecture: string;
  trainingLogs: string;
  framework: string;
};

export type DiagnosisResult = {
  issues: Issue[];
  fixes: Fix[];
  severity: string;
  summary: string;
};

const issueSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  confidence: z.number().min(0).max(100),
  description: z.string().min(1),
  evidence: z.string().min(1)
});

const fixSchema = z.object({
  issueId: z.string().min(1),
  title: z.string().min(1),
  explanation: z.string().min(1),
  codeSnippet: z.string().min(1),
  language: z.string().min(1)
});

const diagnosisSchema = z.object({
  issues: z.array(issueSchema),
  fixes: z.array(fixSchema),
  severity: z.string().min(1),
  summary: z.string().min(1)
});

type MetricSeries = {
  loss: number[];
  valLoss: number[];
  acc: number[];
  valAcc: number[];
};

const lossRegex = /loss=([0-9]*\.?[0-9]+)/gi;
const valLossRegex = /val[_-]?loss=([0-9]*\.?[0-9]+)/gi;
const accRegex = /acc=([0-9]*\.?[0-9]+)/gi;
const valAccRegex = /val[_-]?acc=([0-9]*\.?[0-9]+)/gi;

const issueTemplates: Record<string, Omit<Issue, "id" | "evidence" | "confidence">> = {
  overfitting: {
    name: "Overfitting",
    description:
      "Training metrics improve while validation degrades, suggesting the model is memorizing instead of generalizing."
  },
  underfitting: {
    name: "Underfitting",
    description:
      "Both training and validation performance remain weak, indicating the model is too simple or under-trained."
  },
  vanishing_gradient: {
    name: "Vanishing gradient",
    description:
      "Gradients appear to shrink toward zero, slowing learning in deeper layers."
  },
  exploding_gradient: {
    name: "Exploding gradient",
    description:
      "Gradients or loss values are diverging rapidly, which can destabilize training."
  },
  wrong_loss: {
    name: "Wrong loss function",
    description:
      "The loss function appears mismatched to the task or output activation."
  },
  lr_too_high: {
    name: "Learning rate too high",
    description:
      "Training loss spikes or oscillates, suggesting the optimizer is overshooting."
  },
  lr_too_low: {
    name: "Learning rate too low",
    description:
      "Training progresses too slowly with minimal improvement over many epochs."
  },
  data_leakage: {
    name: "Data leakage",
    description:
      "Validation performance is suspiciously high compared to training, indicating leakage."
  },
  class_imbalance: {
    name: "Class imbalance",
    description:
      "Class distribution appears skewed, reducing recall on minority classes."
  },
  wrong_activation: {
    name: "Wrong activation function",
    description:
      "Activation functions may not align with output targets or are saturating."
  },
  batch_size: {
    name: "Batch size problems",
    description:
      "Batch size likely too small or too large, causing unstable updates."
  },
  nan_loss: {
    name: "NaN loss",
    description:
      "Loss becomes NaN, indicating numerical instability."
  },
  plateau: {
    name: "Training plateau",
    description:
      "Loss/accuracy plateaus early with limited improvement."
  },
  mode_collapse: {
    name: "Mode collapse (GAN)",
    description:
      "GAN outputs collapse to limited modes, reducing diversity."
  },
  dying_relu: {
    name: "Dying ReLU",
    description:
      "ReLU activations are stuck at zero for many neurons."
  }
};

const frameworkFixes: Record<string, Record<string, Fix>> = {
  pytorch: {
    overfitting: {
      issueId: "overfitting",
      title: "Add dropout + weight decay",
      explanation: "Regularization reduces memorization and improves validation performance.",
      codeSnippet: "optimizer = torch.optim.Adam(model.parameters(), lr=1e-4, weight_decay=1e-4)\nmodel.dropout = nn.Dropout(p=0.3)",
      language: "python"
    }
  },
  keras: {
    overfitting: {
      issueId: "overfitting",
      title: "Add dropout + L2",
      explanation: "Regularization improves generalization on validation data.",
      codeSnippet: "model.add(layers.Dropout(0.3))\nmodel.add(layers.Dense(128, kernel_regularizer=keras.regularizers.l2(1e-4)))",
      language: "python"
    }
  }
};

const defaultFixes: Record<string, Fix> = {
  overfitting: {
    issueId: "overfitting",
    title: "Increase regularization",
    explanation: "Add dropout, weight decay, or early stopping to reduce overfitting.",
    codeSnippet: "# Add dropout or L2 regularization\n# Enable early stopping on val_loss",
    language: "text"
  },
  underfitting: {
    issueId: "underfitting",
    title: "Increase model capacity",
    explanation: "Add layers, increase hidden units, or train longer.",
    codeSnippet: "# Increase depth/width or train for more epochs",
    language: "text"
  },
  vanishing_gradient: {
    issueId: "vanishing_gradient",
    title: "Use residual connections",
    explanation: "Residuals and normalization layers help gradients flow.",
    codeSnippet: "# Add residual blocks or normalization layers",
    language: "text"
  },
  exploding_gradient: {
    issueId: "exploding_gradient",
    title: "Apply gradient clipping",
    explanation: "Clipping stabilizes training by bounding gradient norms.",
    codeSnippet: "torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)",
    language: "python"
  },
  wrong_loss: {
    issueId: "wrong_loss",
    title: "Align loss with task",
    explanation: "Use cross-entropy for classification or MSE/MAE for regression.",
    codeSnippet: "# Classification -> CrossEntropyLoss\n# Regression -> MSELoss",
    language: "text"
  },
  lr_too_high: {
    issueId: "lr_too_high",
    title: "Lower learning rate",
    explanation: "Reduce learning rate to avoid divergence.",
    codeSnippet: "optimizer = Adam(lr=1e-4)",
    language: "python"
  },
  lr_too_low: {
    issueId: "lr_too_low",
    title: "Increase learning rate",
    explanation: "Increase learning rate or use warmup schedules.",
    codeSnippet: "optimizer = Adam(lr=3e-4)",
    language: "python"
  },
  data_leakage: {
    issueId: "data_leakage",
    title: "Audit data splits",
    explanation: "Ensure train/val/test splits are strictly separated.",
    codeSnippet: "# Remove duplicated samples across splits",
    language: "text"
  },
  class_imbalance: {
    issueId: "class_imbalance",
    title: "Use class weights",
    explanation: "Class weighting or resampling improves minority recall.",
    codeSnippet: "loss = nn.CrossEntropyLoss(weight=class_weights)",
    language: "python"
  },
  wrong_activation: {
    issueId: "wrong_activation",
    title: "Match activation to output",
    explanation: "Use sigmoid for binary, softmax for multiclass, linear for regression.",
    codeSnippet: "# Binary: sigmoid\n# Multiclass: softmax\n# Regression: linear",
    language: "text"
  },
  batch_size: {
    issueId: "batch_size",
    title: "Tune batch size",
    explanation: "Adjust batch size to balance stability and generalization.",
    codeSnippet: "# Try 16/32/64 and monitor stability",
    language: "text"
  },
  nan_loss: {
    issueId: "nan_loss",
    title: "Stabilize numerics",
    explanation: "Lower LR, add gradient clipping, and check input scaling.",
    codeSnippet: "# Normalize inputs and clamp gradients",
    language: "text"
  },
  plateau: {
    issueId: "plateau",
    title: "Add LR schedule",
    explanation: "Decay learning rate or use cosine schedule to escape plateaus.",
    codeSnippet: "scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer)",
    language: "python"
  },
  mode_collapse: {
    issueId: "mode_collapse",
    title: "Add diversity regularization",
    explanation: "Use feature matching or minibatch discrimination.",
    codeSnippet: "# Add minibatch discrimination or feature matching",
    language: "text"
  },
  dying_relu: {
    issueId: "dying_relu",
    title: "Switch to LeakyReLU",
    explanation: "LeakyReLU keeps gradients flowing for negative inputs.",
    codeSnippet: "activation = nn.LeakyReLU(0.1)",
    language: "python"
  }
};

function parseMetrics(logs: string): MetricSeries {
  const loss: number[] = [];
  const valLoss: number[] = [];
  const acc: number[] = [];
  const valAcc: number[] = [];

  for (const match of logs.matchAll(lossRegex)) {
    loss.push(Number(match[1]));
  }
  for (const match of logs.matchAll(valLossRegex)) {
    valLoss.push(Number(match[1]));
  }
  for (const match of logs.matchAll(accRegex)) {
    acc.push(Number(match[1]));
  }
  for (const match of logs.matchAll(valAccRegex)) {
    valAcc.push(Number(match[1]));
  }

  return { loss, valLoss, acc, valAcc };
}

function trendImproves(values: number[]) {
  if (values.length < 3) return false;
  return values[0] > values[values.length - 1];
}

function trendWorsens(values: number[]) {
  if (values.length < 3) return false;
  return values[0] < values[values.length - 1];
}

function hasPlateau(values: number[]) {
  if (values.length < 4) return false;
  const recent = values.slice(-3);
  const max = Math.max(...recent);
  const min = Math.min(...recent);
  return max - min < 0.01;
}

function buildFix(framework: string, issueId: string): Fix {
  const key = framework.toLowerCase();
  const byFramework = frameworkFixes[key]?.[issueId];
  if (byFramework) return byFramework;
  return defaultFixes[issueId];
}

function buildIssue(
  id: string,
  evidence: string,
  confidence: number
): Issue {
  return {
    id,
    name: issueTemplates[id].name,
    description: issueTemplates[id].description,
    evidence,
    confidence
  };
}

export async function runDiagnosisEngine(
  input: DiagnosisInput
): Promise<DiagnosisResult> {
  const logs = input.trainingLogs.toLowerCase();
  const architecture = input.modelArchitecture.toLowerCase();
  const metrics = parseMetrics(input.trainingLogs);
  const issues: Issue[] = [];

  if (trendImproves(metrics.loss) && trendWorsens(metrics.valLoss)) {
    issues.push(buildIssue("overfitting", "val_loss rising while loss decreases", 82));
  }

  if (!trendImproves(metrics.loss) && metrics.loss.length > 2) {
    issues.push(buildIssue("underfitting", "loss not decreasing over epochs", 70));
  }

  if (logs.includes("nan") || logs.includes("inf")) {
    issues.push(buildIssue("nan_loss", "loss contains NaN/Inf", 90));
  }

  if (logs.includes("gradient") && logs.includes("0.0")) {
    issues.push(buildIssue("vanishing_gradient", "gradient values near zero", 68));
  }

  if (logs.includes("gradient") && logs.includes("overflow")) {
    issues.push(buildIssue("exploding_gradient", "gradient overflow in logs", 78));
  }

  if (logs.includes("loss exploded") || logs.includes("diverged")) {
    issues.push(buildIssue("lr_too_high", "loss diverged quickly", 75));
  }

  if (hasPlateau(metrics.loss)) {
    issues.push(buildIssue("plateau", "loss plateaued in recent epochs", 65));
  }

  if (logs.includes("overfit") || logs.includes("generalization gap")) {
    issues.push(buildIssue("overfitting", "explicit overfitting mention in logs", 85));
  }

  if (logs.includes("imbalanced") || logs.includes("class imbalance")) {
    issues.push(buildIssue("class_imbalance", "class imbalance mentioned", 72));
  }

  if (architecture.includes("relu") && logs.includes("dead")) {
    issues.push(buildIssue("dying_relu", "dead ReLU activations", 66));
  }

  if (architecture.includes("gan") || logs.includes("mode collapse")) {
    issues.push(buildIssue("mode_collapse", "GAN collapse detected", 74));
  }

  if (logs.includes("val_acc") && metrics.valAcc.length > 2 && metrics.acc.length > 2) {
    const valGain = metrics.valAcc[metrics.valAcc.length - 1] - metrics.valAcc[0];
    const trainGain = metrics.acc[metrics.acc.length - 1] - metrics.acc[0];
    if (valGain > trainGain + 0.2) {
      issues.push(buildIssue("data_leakage", "validation accuracy jumps ahead of training", 80));
    }
  }

  if (issues.length === 0) {
    issues.push(buildIssue("plateau", "no clear improvement signals detected", 50));
  }

  const fixes = issues.map((issue) => buildFix(input.framework, issue.id));

  const severityScore = issues.reduce((sum, issue) => sum + issue.confidence, 0);
  const average = severityScore / issues.length;
  const severity = average > 85 ? "CRITICAL" : average > 70 ? "HIGH" : average > 55 ? "MEDIUM" : "LOW";

  const summary = `Detected ${issues.length} potential issue(s). Highest confidence: ${issues[0].name}.`;

  const result: DiagnosisResult = { issues, fixes, severity, summary };
  const validated = diagnosisSchema.safeParse(result);
  if (!validated.success) {
    throw new Error("Local diagnosis failed validation.");
  }

  return validated.data;
}
