import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Comment, ImageProps } from '@/api/types';
import Carousel from '@/components/Carousel';
import Icon from '@/components/Icon';

const CommentsWrapper = styled.div`
  margin: 30px 0 0 0;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const CommentsMainImage = styled.div<{ backgroundImage: string }>`
  background: ${({ backgroundImage }) =>
    `url(${backgroundImage}) no-repeat center center`};
  background-size: cover;
  width: 50px;
  height: 50px;
  border-radius: 20px;
  position: absolute;
  left: -25px;
`;

const CommentsButton = styled.button`
  font-size: 1rem;
  display: flex;
  align-self: center;
  align-items: center;
  width: 80%;
  position: relative;
  padding: 20px 35px;
  margin-left: 25px;
  background-color: ${({ theme }) => theme.white};
  box-sizing: border-box;
  border-radius: 20px;
  border: 2px solid ${({ theme }) => theme.secondary};
`;

const IconContainer = styled.div<{ expanded: boolean }>`
  transform: rotate(90deg);
  margin-left: 10px;
  ${({ expanded }) =>
    expanded &&
    `
    transform: rotate(270deg)
  `}
`;

const Expandable = styled.div<{ expanded: boolean }>`
  background-color: ${({ theme }) => theme.lightgray};
  border-radius: 20px;
  padding: 50px 0 20px 0;
  margin: -30px 10px 30px 10px;
  display: flex;
  flex-direction: row;
  ${({ expanded }) =>
    !expanded &&
    `
    height: 0px;
    padding: 0px;
    margin: 30px;
  `};
`;

const SingleComment = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 150px;
  margin: 25px 10px 10px 10px;
  padding-top: 15px;
  box-sizing: border-box;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.white};
  box-shadow: 0px 4px 10px rgba(184, 184, 184, 0.25);
`;

const CommentImage = styled.div<{ backgroundImage: string }>`
  position: absolute;
  top: -25px;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  background: ${({ backgroundImage }) =>
    `url(${backgroundImage}) no-repeat center center`};
  background-size: cover;
`;

const CommentText = styled.div`
  text-align: center;
  font-size: 14px;
  padding: 15px;
  user-select: none;
`;

interface CommentsProps {
  comments: Comment[];
  commentImage: ImageProps;
  commentTitle: string;
}

function Comments({ comments, commentImage, commentTitle }: CommentsProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <CommentsWrapper>
      <CommentsButton
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-controls="comments-expandable-section"
      >
        {commentImage && (
          <CommentsMainImage backgroundImage={commentImage.src} />
        )}

        <div id="comments-button-label">{commentTitle}</div>
        <IconContainer expanded={expanded}>
          <Icon alt={t('icon.chevronRight')} icon="chevron-right" size={20} />
        </IconContainer>
      </CommentsButton>

      <Expandable
        expanded={expanded}
        id="comments-expandable-section"
        role="region"
        aria-labelledby="comments-button-label"
      >
        <Carousel>
          {comments.map((comment, index) => (
            <SingleComment key={index}>
              <CommentImage backgroundImage={comment.image.src} />
              <CommentText>{`"${comment.quote}"`}</CommentText>
            </SingleComment>
          ))}
        </Carousel>
      </Expandable>
    </CommentsWrapper>
  );
}

export default Comments;
