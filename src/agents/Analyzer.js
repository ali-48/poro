export class Analyzer {
  constructor(memory) {
    this.tools = ['InternetSearchTool', 'ContextMemoryTool'];
    this.memory = memory;
  }

  async analyzeProject(projectBrief) {
    if (!projectBrief) throw new Error('Project brief required');
    
    const analysis = {
      backendComponents: await this.identifyBackendComponents(projectBrief),
      frontendComponents: this.extractFrontendRequirements(projectBrief),
      technicalConstraints: this.detectConstraints(projectBrief),
      recommendedTools: await this.researchTools(projectBrief)
    };

    this.memory.storeAnalysis(projectBrief.id, analysis);
    return analysis;
  }

  async identifyBackendComponents(brief) {
    const similarProjects = await this.memory.searchSimilarProjects(brief);
    return [
      {
        name: 'API Core',
        description: 'Gestion des opérations principales',
        technologies: ['Node.js', 'FastAPI'],
        patterns: similarProjects?.apiPatterns || ['REST', 'GraphQL']
      },
      {
        name: 'Gestion des tÃ¢ches',
        description: 'Orchestration des workflows IA',
        technologies: ['Celery', 'RabbitMQ']
      }
    ];
  }

  extractFrontendRequirements(brief) {
    return brief.requirements
      .filter(req => req.includes('interface') || req.includes('UI'))
      .map(req => ({
        component: req.split(' ')[0],
        interactions: ['drag-drop', 'visualisation']
      }));
  }

  async researchTools(brief) {
    const searchResults = await this.tools[0].search(brief.technologies);
    return searchResults
      .filter(tool => !tool.nativeDependencies)
      .slice(0, 5);
  }

  detectConstraints(brief) {
    return [
      'WebContainer limitations',
      'Python Standard Library only',
      'No persistent storage'
    ];
  }
}
