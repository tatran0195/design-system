'use client';

import { ArrowUturnLeft } from '@cms/icons';
import { useChat } from '@kapaai/react-sdk';
import clsx from 'clsx';
import type React from 'react';
import { Fragment, useCallback, useState } from 'react';
import { useAiAssistant } from '@/providers/AiAssistant';
import { useSearch } from '@/providers/Search';
import { useSearchNavigation } from '../../../hooks/use-search-navigation';
import { Badge } from '../../Badge';
import { Button } from '../../Button';
import { InputText } from '../../Input/Text';
import { Kbd } from '../../Kbd';
import { Link } from '../../Link';
import { Tooltip } from '../../Tooltip';
import { AiAssistantSuggestions } from '../Suggestions';
import { AiAssistantThreadItem } from '../ThreadItem';

export const AiAssistantSearchWindow = () => {
  const { conversation, submitQuery, error } = useChat();
  const { inputRef, contentRef, loading } = useAiAssistant();
  const [question, setQuestion] = useState('');
  const { setCommand } = useSearch();

  const getThreadItems = useCallback(
    () =>
      conversation.map((item, index) => (
        <Fragment key={index}>
          <AiAssistantThreadItem
            item={{
              type: 'question',
              content: item.question,
              sources: item.sources,
              question_id: item.id,
            }}
          />
          <AiAssistantThreadItem
            item={{
              type: 'answer',
              content: item.answer,
              sources: item.sources,
              question_id: item.id,
            }}
          />
        </Fragment>
      )),
    [conversation],
  );

  useSearchNavigation({
    getInputElm: () => inputRef.current as HTMLInputElement | null,
    focusInput: () => inputRef.current?.focus(),
    handleSubmit: () => {
      if (question.length > 0) {
        submitQuery(question);
      }
    },
  });

  return (
    <div className="h-full">
      <div className={clsx('px-docs_1 pt-docs_1')}>
        <Tooltip
          tooltipChildren={
            <>
              This site is protected by reCAPTCHA and the <Link href="https://policies.google.com/privacy">Google Privacy Policy</Link> and{' '}
              <Link href="https://policies.google.com/terms">ToS</Link> apply
            </>
          }
          clickable={true}
        >
          <Badge variant="neutral">AI Assistant</Badge>
        </Tooltip>
      </div>
      <div
        className={clsx(
          'flex gap-docs_1 px-docs_1 py-docs_0.75',
          'h-[57px] w-full md:rounded-t-docs_xl relative border-0 border-solid',
          'border-b border-cms-border-base relative',
        )}
      >
        <Button variant="transparent" onClick={() => setCommand(null)} className="text-cms-fg-muted p-[6.5px]">
          <ArrowUturnLeft />
        </Button>
        <InputText
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={clsx(
            'bg-transparent border-0 focus:outline-none hover:!bg-transparent',
            '!shadow-none flex-1 text-cms-fg-base',
            'disabled:!bg-transparent disabled:cursor-not-allowed',
          )}
          placeholder="Ask me a question about CMS..."
          autoFocus={true}
          passedRef={inputRef as React.RefObject<HTMLInputElement | null>}
          disabled={loading}
        />
        <span
          onClick={() => {
            setQuestion('');
            inputRef.current?.focus();
          }}
          className={clsx(
            'text-cms-fg-muted hover:text-cms-fg-subtle',
            'absolute top-docs_0.75 right-docs_1',
            'cursor-pointer',
            question.length === 0 && 'hidden',
          )}
        >
          Clear
        </span>
      </div>
      <div className="h-[calc(100%-95px)] lg:max-h-[calc(100%-140px)] lg:min-h-[calc(100%-140px)] overflow-auto">
        <div ref={contentRef}>
          {!conversation.length && <AiAssistantSuggestions className="mx-docs_0.5" />}
          {getThreadItems()}
          {error?.length && (
            <AiAssistantThreadItem
              item={{
                type: 'error',
                content: error,
              }}
            />
          )}
        </div>
      </div>
      <div
        className={clsx(
          'py-docs_0.75 hidden md:flex items-center justify-end px-docs_1',
          'border-cms-border-base border-t',
          'bg-cms-bg-field-component',
        )}
      >
        <div className="flex items-center gap-docs_0.75">
          <div className="flex items-center gap-docs_0.5">
            {conversation.length === 0 && (
              <>
                <span className={clsx('text-cms-fg-subtle', 'text-compact-x-small')}>Navigate FAQ</span>
                <span className="gap-[5px] flex">
                  <Kbd className={clsx('!bg-cms-bg-field-component !border-cms-border-strong', '!text-cms-fg-subtle h-[18px] w-[18px] p-0')}>↑</Kbd>
                  <Kbd className={clsx('!bg-cms-bg-field-component !border-cms-border-strong', '!text-cms-fg-subtle h-[18px] w-[18px] p-0')}>↓</Kbd>
                </span>
              </>
            )}
            {conversation.length > 0 && <span className={clsx('text-cms-fg-muted', 'text-compact-x-small')}>Chat is cleared on exit</span>}
          </div>
          <div className={clsx('h-docs_0.75 w-px bg-cms-border-strong')} />
          <div className="flex items-center gap-docs_0.5">
            <span className={clsx('text-cms-fg-subtle', 'text-compact-x-small')}>Ask Question</span>
            <Kbd className={clsx('!bg-cms-bg-field-component !border-cms-border-strong', '!text-cms-fg-subtle h-[18px] w-[18px] p-0')}>↵</Kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
