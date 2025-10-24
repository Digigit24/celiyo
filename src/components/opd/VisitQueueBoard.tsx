// src/components/opd/VisitQueueBoard.tsx
import type { Visit } from '@/types/opd.types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VisitQueueBoardProps {
  waiting: Visit[];
  called: Visit[];
  inConsultation: Visit[];
  isLoading: boolean;
  onVisitClick: (visit: Visit) => void;
  onRefresh: () => void;
}

export default function VisitQueueBoard({
  waiting,
  called,
  inConsultation,
  isLoading,
  onVisitClick,
  onRefresh,
}: VisitQueueBoardProps) {
  const QueueColumn = ({
    title,
    icon: Icon,
    visits,
    color,
    emptyMessage,
  }: {
    title: string;
    icon: any;
    visits: Visit[];
    color: string;
    emptyMessage: string;
  }) => (
    <div className="flex-1 min-w-[280px]">
      <div className={`${color} border rounded-lg p-3 mb-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <h3 className="font-semibold">{title}</h3>
          </div>
          <Badge variant="secondary" className="font-mono">
            {visits.length}
          </Badge>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-3 pr-4">
          {visits.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Icon className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              </div>
            </Card>
          ) : (
            visits.map((visit, index) => (
              <Card
                key={visit.id}
                className="p-4 hover:shadow-md transition-all cursor-pointer group relative"
                onClick={() => onVisitClick(visit)}
              >
                {/* Queue Number Badge */}
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>

                {/* Patient Info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1 truncate">
                      {visit.patient_details?.full_name || visit.patient_name}
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      {visit.visit_number}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs">
                  {visit.patient_details && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{visit.patient_details.age}y</span>
                      <span>•</span>
                      <span>{visit.patient_details.gender}</span>
                      {visit.patient_details.blood_group && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs px-1 h-5">
                            {visit.patient_details.blood_group}
                          </Badge>
                        </>
                      )}
                    </div>
                  )}

                  {(visit.doctor_details || visit.doctor_name) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Stethoscope className="h-3 w-3" />
                      <span className="truncate">
                        Dr. {visit.doctor_details?.full_name || visit.doctor_name}
                      </span>
                    </div>
                  )}

                  {visit.entry_time && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(visit.entry_time), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Visit Type Badge */}
                <div className="mt-3 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      visit.visit_type === 'emergency'
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : visit.visit_type === 'follow_up'
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-purple-100 text-purple-700 border-purple-200'
                    }
                  >
                    {visit.visit_type === 'new' && 'New'}
                    {visit.visit_type === 'follow_up' && 'Follow-up'}
                    {visit.visit_type === 'emergency' && 'Emergency'}
                  </Badge>
                </div>

                {/* Hover indicator */}
                <div className="absolute inset-0 border-2 border-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 md:p-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Patient Queue Board</h2>
          <p className="text-sm text-muted-foreground">
            Real-time view of patient flow
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh Queue
        </Button>
      </div>

      {/* Queue Flow Diagram */}
      <div className="hidden md:flex items-center justify-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm font-medium">Waiting</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-sm font-medium">Called</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm font-medium">In Consultation</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm font-medium">Completed</span>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="flex gap-4 overflow-x-auto">
        <QueueColumn
          title="Waiting Room"
          icon={Clock}
          visits={waiting}
          color="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
          emptyMessage="No patients waiting"
        />

        <QueueColumn
          title="Called"
          icon={AlertCircle}
          visits={called}
          color="bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400"
          emptyMessage="No patients called"
        />

        <QueueColumn
          title="In Consultation"
          icon={Stethoscope}
          visits={inConsultation}
          color="bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400"
          emptyMessage="No ongoing consultations"
        />
      </div>
    </div>
  );
}