import { useState } from 'react';
import { reachMetrikaGoal } from '../utils/metrika';
import { LeadSubmissionError, submitLead, type LeadSubmission } from '../utils/leadSubmission';

export const useLeadSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [requestId, setRequestId] = useState('');

  const send = async (submission: LeadSubmission, goal: string, files: File[] = []) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const result = await submitLead(submission, files);
      setRequestId(result.requestId);
      reachMetrikaGoal(goal);
      return true;
    } catch (error) {
      setSubmitError(error instanceof LeadSubmissionError ? error.message : 'Не удалось отправить заявку.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSubmission = () => {
    setSubmitError('');
    setRequestId('');
    setIsSubmitting(false);
  };

  return { isSubmitting, submitError, requestId, send, resetSubmission };
};
