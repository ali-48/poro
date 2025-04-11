export class Planner {
  constructor(memory) {
    this.tools = ['FilePlannerTool', 'ContextMemoryTool'];
    this.memory = memory;
  }

  async generateProjectStructure(analysis) {
    if (!analysis?.backendComponents) {
      throw new Error('Analyse technique requise');
    }

    const globalPrompt = this.createGlobalPrompt(analysis);
    const projectStructure = this.buildFileTree(analysis);
    
    this.memory.storePlan(projectStructure);
    return { globalPrompt, projectStructure };
  }

  createGlobalPrompt(analysis) {
    return `## Objectif Principal
Développer un système ${analysis.projectType} avec :
- Backend: ${analysis.backendComponents.map(c => c.name).join(', ')}
- Frontend: ${analysis.frontendComponents.map(c => c.component).join(', ')}

## Exigences Techniques
${analysis.technicalConstraints.map(t => `* ${t}`).join('\n')}

## Contraintes
${this.formatConstraints(analysis)}`;
  }

  buildFileTree(analysis) {
    const baseStructure = this.getStructureTemplate(analysis.recommendedTools);
    return {
      ...baseStructure,
      files: this.generateFileDescriptions(analysis)
    };
  }

  generateFileDescriptions(analysis) {
    return [
      ...analysis.backendComponents.map(c => ({
        path: `src/${c.name.toLowerCase().replace(/ /g, '_')}.py`,
        description: `Implémentation de ${c.description}`,
        dependencies: c.technologies
      })),
      ...analysis.frontendComponents.map(c => ({
        path: `public/${c.component}.jsx`,
        description: `Composant ${c.component} avec ${c.interactions.join(', ')}`,
        dependencies: ['React']
      }))
    ];
  }

  formatConstraints(analysis) {
    return analysis.technicalConstraints
      .concat('Pas de compilation native')
      .map(c => `- ${c}`)
      .join('\n');
  }

  getStructureTemplate(tools) {
    return {
      rootDir: 'project',
      structure: tools.includes('Node.js') ? 
        this.getNodeStructure() : 
        this.getPythonStructure()
    };
  }

  getNodeStructure() {
    return {
      dirs: [
        'src/api',
        'src/utils',
        'public/components'
      ],
      configFiles: [
        'package.json',
        'webpack.config.js'
      ]
    };
  }

  getPythonStructure() {
    return {
      dirs: [
        'src/core',
        'src/services',
        'tests'
      ],
      configFiles: [
        'requirements.txt',
        'Dockerfile'
      ]
    };
  }
}
