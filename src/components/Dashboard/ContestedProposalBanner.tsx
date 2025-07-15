import React from 'react';
import { AlertTriangle, Eye, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContestedProposals, ContestedProposal } from '@/hooks/useContestedProposals';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ContestedProposalBanner = () => {
  const { contestedProposals, unreadCount, markAsRead, dismissAll } = useContestedProposals();
  const navigate = useNavigate();

  const unreadContested = contestedProposals.filter(p => !p.is_read);

  if (unreadCount === 0) {
    return null;
  }

  const handleViewProposal = (proposal: ContestedProposal) => {
    markAsRead(proposal.id);
    navigate(`/proposals/${proposal.id}`);
  };

  const truncateComment = (comment: string, maxLength: number = 100) => {
    if (comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength) + '...';
  };

  return (
    <div className="mb-6">
      <Card className="border-destructive bg-destructive/5 border-l-4 border-l-destructive">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-destructive">
                {unreadCount === 1 
                  ? 'Proposta Contestada' 
                  : `${unreadCount} Propostas Contestadas`
                }
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissAll}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {unreadContested.slice(0, 3).map((proposal) => (
              <div 
                key={proposal.id}
                className="bg-background/50 rounded-lg p-3 border border-destructive/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {proposal.proposal_number}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        Contestada
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>{proposal.client.name}</strong> - {proposal.title}
                    </p>
                    
                    {proposal.latest_comment && (
                      <p className="text-sm text-foreground">
                        "{truncateComment(proposal.latest_comment.comments)}"
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(proposal.updated_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead(proposal.id)}
                      className="h-8 px-2"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleViewProposal(proposal)}
                      className="h-8 px-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {unreadCount > 3 && (
            <div className="mt-3 pt-3 border-t border-destructive/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/proposals?status=contested')}
                className="w-full"
              >
                Ver todas as {unreadCount} propostas contestadas
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ContestedProposalBanner;