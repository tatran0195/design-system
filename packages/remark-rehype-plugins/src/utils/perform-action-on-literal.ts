import { isExpressionJsVarLiteral, isExpressionJsVarObj } from '@cms/docs-utils';
import type { ExpressionJsVar, ExpressionJsVarLiteral } from '@cms/docs-types';

export const performActionOnLiteral = (
  item:
    | ExpressionJsVar[]
    | ExpressionJsVar
    | {
        // handle the case when the literal has a name property,
        // such as for workflow diagram links
        name: string;
        value?: ExpressionJsVar | ExpressionJsVar[];
      },
  action: (item: ExpressionJsVarLiteral) => void,
) => {
  if (Array.isArray(item)) {
    for (const i of item) {
      performActionOnLiteral(i, action);
    }
  } else if (isExpressionJsVarLiteral(item)) {
    action(item);
  } else {
    for (const value of Object.values(item)) {
      if (Array.isArray(value) || isExpressionJsVarObj(value)) {
        performActionOnLiteral(value, action);
      } else if (isExpressionJsVarLiteral(value)) {
        action(value);
      }
    }
  }
};
