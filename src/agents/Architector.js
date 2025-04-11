export class Architector {
  constructor(memory) {
    this.tools = ['ContextMemoryTool', 'PromptOptimizerTool'];
    this.memory = memory;
    this.validationAttempts = 0;
    this.maxRestarts = 3;
  }

  async validateOutput(projectStructure) {
    const validationReport = {
      isValid: true,
      errors: [],
      restartRequired: false
    };

    // Validation de la structure globale
    if (!this.validateStructureIntegrity(projectStructure)) {
      validationReport.errors.push('Incohérence structurelle détectée');
      validationReport.isValid = false;
    }

    // Vérification des politiques RLS
    if (!this.checkRLSPolicies(projectStructure)) {
      validationReport.errors.push('Politiques de sécurité manquantes');
      validationReport.isValid = false;
    }

    // Analyse de la cohérence des prompts
    const promptValidation = this.validatePrompts(projectStructure.prompts);
    validationReport.errors.push(...promptValidation.errors);

    if (validationReport.errors.length > 0) {
      validationReport.isValid = false;
      validationReport.restartRequired = 
        this.validationAttempts < this.maxRestarts;
    }

    this.memory.storeValidationReport(validationReport);

    if (!validationReport.isValid && validationReport.restartRequired) {
      await this.restartWorkflow();
    }

    return validationReport;
  }

  validateStructureIntegrity(structure) {
    return structure.components.every(component => 
      component.dependencies.every(dep => 
        structure.dependencies.includes(dep)
    );
  }

  checkRLSPolicies(structure) {
    return structure.tables.every(table => 
      table.rlsEnabled && table.policies.length > 0
    );
  }

  validatePrompts(prompts) {
    const result = { valid: true, errors: [] };
    
    prompts.forEach((prompt, index) => {
      if (prompt.length > 1000) {
        result.errors.push(`Prompt ${index + 1} dépasse 1000 caractères`);
        result.valid = false;
      }
      
      if (!prompt.includes('## Objectif')) {
        result.errors.push(`Prompt ${index + 1} manque la section Objectif`);
        result.valid = false;
      }
    });

    return result;
  }

  async restartWorkflow() {
    this.validationAttempts++;
    this.memory.resetCurrentIteration();
    console.log(`Relancement du workflow (tentative ${this.validationAttempts}/${this.maxRestarts})`);
    
    // Logique de réinitialisation sécurisée
    await this.memory.cleanPartialOutputs();
    this.memory.storeSystemEvent('WORKFLOW_RESTART', {
      attempt: this.validationAttempts,
      timestamp: Date.now()
    });
  }
}
