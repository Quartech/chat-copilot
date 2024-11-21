using System;
using System.Linq.Expressions;

namespace CopilotChat.WebApi.Utilities;

public static class PredicateUtils
{
    public static Expression<Func<T, bool>> And<T>(
        this Expression<Func<T, bool>> expr1,
        Expression<Func<T, bool>> expr2
    )
    {
        var parameterReplacer = new ParameterReplacer(expr2.Parameters[0], expr1.Parameters[0]);
        var body = parameterReplacer.Visit(expr2.Body);

        return Expression.Lambda<Func<T, bool>>(Expression.AndAlso(expr1.Body, body), expr1.Parameters);
    }

    private class ParameterReplacer : ExpressionVisitor
    {
        private readonly ParameterExpression _from;
        private readonly ParameterExpression _to;

        public ParameterReplacer(ParameterExpression from, ParameterExpression to)
        {
            this._from = from;
            this._to = to;
        }

        protected override Expression VisitParameter(ParameterExpression node)
        {
            // Replace the parameter in expr2 with the parameter from expr1
            return node == this._from ? this._to : base.VisitParameter(node);
        }
    }
}
