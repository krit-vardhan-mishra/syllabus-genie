import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Topic {
  id: string;
  title: string;
  importance: "high" | "medium" | "low";
  description: string;
}

interface TopicsListProps {
  topics: Topic[];
}

const TopicsList = ({ topics }: TopicsListProps) => {
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "bg-accent text-accent-foreground";
      case "medium":
        return "bg-primary text-primary-foreground";
      case "low":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="text-3xl font-bold text-center mb-8">
        Important Topics to Focus On
      </h2>

      <div className="grid gap-4">
        {topics.map((topic, index) => (
          <Card
            key={topic.id}
            className="p-6 hover:shadow-warm transition-shadow duration-300"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: "slideUp 0.5s ease-out forwards",
              opacity: 0,
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{topic.title}</h3>
                  <Badge className={getImportanceColor(topic.importance)}>
                    {topic.importance}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{topic.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TopicsList;