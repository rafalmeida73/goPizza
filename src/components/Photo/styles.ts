import styled, { css } from 'styled-components/native';

export const Container = styled.Image`
  height: 160px;
  width: 160px;
  border-radius: 80px;
`;

export const Placeholder = styled.View`
  height: 160px;
  width: 160px;
  border-radius: 80px;

  justify-content: center;
  align-items: center;

  border: 1px dashed ${({ theme }) => theme.COLORS.SUCCESS_900};
`;

export const PlaceholderTitle = styled.Text`
  font-size: 14px;
  text-align: center;

  ${({ theme }) => css`
    font-family: ${theme.FONTS.TEXT};
    color: ${theme.COLORS.SUCCESS_900};
  `}
`;
