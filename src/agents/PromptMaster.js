export class PromptMaster {
  constructor(memory) {
    this.tools = ['LLMTaskSplitterTool', 'PromptOptimizerTool', 'ContextMemoryTool'];
    this.memory = memory;
    this.tokenLimit = 750;
  }

  splitPrompt(globalPrompt) {
    if (!globalPrompt || globalPrompt.length < 50) {
      throw new Error('Prompt global non valide ou trop court');
    }

    const sections = this.detectPromptSections(globalPrompt);
    return this.processSections(sections);
  }

  detectPromptSections(prompt) {
    const sectionRegex = /(#{2,3} .+?)(?=\n#{2,3} |\n*$)/gs;
    return [...prompt.matchAll(sectionRegex)].map(match => ({
      header: match[1].trim(),
      content: match[0].replace(match[1], '').trim()
    }));
  }

  processSections(sections) {
    return sections.map((section, index) => ({
      id: `SP-${Date.now()}-${index}`,
      header: this.optimizeHeader(section.header),
      content: this.chunkContent(section.content),
      dependencies: this.findDependencies(section.content),
      tokens: this.countTokens(section.content)
    }));
  }

  chunkContent(content) {
    const chunks = [];
    let currentChunk = '';
    
    content.split('\n').forEach(line => {
      if ((currentChunk + line).length > this.tokenLimit) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      currentChunk += line + '\n';
    });

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks.map((c, i) => this.optimizePrompt(c, i + 1));
  }

  optimizePrompt(content, chunkNumber = 1) {
    const optimized = this.applyOptimizationRules(content);
    return `## Sous-prompt ${chunkNumber}\n${optimized}\n\n## Exemple de sortie\n<!-- Structure attendue -->`;
  }

  applyOptimizationRules(content) {
    return content
      .replace(/\s+/g, ' ')
      .replace(/(\. )/g, '.\n')
      .replace(/(\d+\.)/g, '\n$1')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .join('\n');
  }

  validateSubprompt(subprompt) {
    const errors = [];
    if (subprompt.content.length > this.tokenLimit) errors.push('Dépassement de tokens');
    if (!subprompt.content.includes('## Objectif')) errors.push('Section Objectif manquante');
    if (subprompt.content.split('\n').length < 5) errors.push('Structure trop pauvre');
    return errors.length ? { valid: false, errors } : { valid: true };
  }

  generateNumberedList(subprompts) {
    return subprompts.map((sp, i) => 
      `${i + 1}. ${sp.header}\n   ${sp.content.slice(0, 100)}...\n   Dépendances: ${sp.dependencies.join(', ') || 'Aucune'}`
    ).join('\n\n');
  }

  countTokens(text) {
    return Math.ceil(text.split(/\s+/).length * 0.75;
  }
}
