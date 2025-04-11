from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
import os
from supabase import create_client

@CrewBase
class PromptGeneratorCrew():
    """Générateur de prompts structurés pour outils IA et automation DevOps"""

    def __init__(self):
        self.supabase = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_ANON_KEY')
        )

    @agent
    def architector(self) -> Agent:
        return Agent(
            role='Superviseur de projet',
            goal='Coordonner les agents et valider les résultats',
            backstory='Architecte IA expérimenté en gestion de workflows complexes',
            verbose=True,
            tools=[self._context_memory_tool],
            allow_delegation=True
        )

    @agent
    def analyzer(self) -> Agent:
        return Agent(
            role='Analyste technique',
            goal='Identifier les composants backend/frontend',
            backstory='Expert en analyse d\'architectures logicielles',
            verbose=True,
            tools=[self._internet_search_tool]
        )

    @agent
    def planner(self) -> Agent:
        return Agent(
            role='Planificateur technique',
            goal='Générer l\'arborescence du projet',
            backstory='Spécialiste en structuration de projets IA',
            verbose=True,
            tools=[self._file_planner_tool]
        )

    @agent
    def promptmaster(self) -> Agent:
        return Agent(
            role='Ingénieur de prompts',
            goal='Découper et optimiser les prompts',
            backstory='Expert en modularisation de tâches IA',
            verbose=True,
            tools=[self._prompt_optimizer_tool]
        )

    @task
    def analyse_project(self) -> Task:
        return Task(
            description='Analyser le projet et identifier les composants clés',
            agent=self.analyzer(),
            expected_output='Liste détaillée des composants techniques',
            context=["knowledge/project_description.txt"]
        )

    @task
    def generate_structure(self) -> Task:
        return Task(
            description='Générer la structure technique du projet',
            agent=self.planner(),
            expected_output='Arborescence complète avec descriptions',
            output_file='output/project_structure.json'
        )

    @task
    def split_prompts(self) -> Task:
        return Task(
            description='Découper le prompt global en sous-tâches',
            agent=self.promptmaster(),
            expected_output='Liste de sous-prompts optimisés',
            output_file='output/subprompts.md'
        )

    @task
    def supervise(self) -> Task:
        return Task(
            description='Valider la cohérence globale des résultats',
            agent=self.architector(),
            expected_output='Rapport de validation complet',
            output_file='output/validation_report.md'
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=[self.architector(), self.analyzer(), self.planner(), self.promptmaster()],
            tasks=[self.analyse_project(), self.generate_structure(), self.split_prompts(), self.supervise()],
            process=Process.sequential,
            verbose=2
        )

    # Tools implementations
    def _context_memory_tool(self, query):
        return self.supabase.table('project_context').select('*').execute()

    def _internet_search_tool(self, query):
        # Implémentation de la recherche web
        pass

    def _file_planner_tool(self, structure):
        # Génération d'arborescence
        pass

    def _prompt_optimizer_tool(self, prompt):
        # Optimisation de prompt
        pass
