import { SurveyStepper } from "@/components/survey-renderer/survey-stepper";

interface SurveyPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  await params;

  return <SurveyStepper />;
}
