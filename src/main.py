import os
from dotenv import load_dotenv
from supabase import create_client
from src.agents.crew import PromptGeneratorCrew

# Chargement de la configuration
load_dotenv()

def main():
    # Initialisation Supabase
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_ANON_KEY')
    )

    try:
        # Création de l'équipe CrewAI
        crew = PromptGeneratorCrew().crew()
        
        # Exécution du workflow
        result = crew.kickoff(inputs={
            'project_description': 'project_description.md',
            'technical_constraints': ['WebContainer', 'Python Standard Library']
        })

        # Sauvegarde des résultats
        supabase.table('workflows').insert({
            'status': 'completed',
            'result': result
        }).execute()

        print("✅ Workflow exécuté avec succès!")
        print(result)

    except Exception as e:
        supabase.table('error_logs').insert({
            'error': str(e),
            'context': 'main_execution'
        }).execute()
        print(f"❌ Erreur lors de l'exécution: {e}")

if __name__ == "__main__":
    main()
