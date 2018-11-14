import React from 'react';
import renderer from 'react-test-renderer'; // eslint-disable-line

import Announcement, {
  createDoughnutElements,
  createTooltip,
  getColumnInfos,
  getSentimentsCount,
  dirtySplitHack
} from './announcement';

describe('Announcement component', () => {
  const announcementContent = {
    body: '<p>Bonjour à tous</p><p>Nous allons mettre un deuxieme paragraphe</p><p>Et un peu de <strong>texte en gras</strong>'
  };
  const fakePost1 = {
    __typename: 'PostEdge',
    node: {
      __typename: 'Post',
      id: '9706',
      parentId: 'null',
      creationDate: '2018-02-21T18:07:49.630164+00:00',
      publicationState: 'PUBLISHED',
      originalLocale: 'fr',
      sentimentCounts: { like: 2, disagree: 1, dontUnderstand: 0, moreInfo: 1, __typename: 'SentimentCounts' }
    }
  };
  const fakePost2 = {
    __typename: 'PostEdge',
    node: {
      __typename: 'Post',
      id: '9706',
      parentId: '9706',
      creationDate: '2018-02-21T18:08:14.590132+00:00',
      publicationState: 'PUBLISHED',
      originalLocale: 'fr',
      sentimentCounts: { like: 1, disagree: 1, dontUnderstand: 9, moreInfo: 0, __typename: 'SentimentCounts' }
    }
  };
  const fakeThreadPosts = { edges: [fakePost1, fakePost2] };
  describe('<Announcement/> on a thread', () => {
    it('should render an announcement with the content associated to a thread idea', () => {
      const threadIdea = {
        id: '1234',
        messageColumns: [],
        messageViewOverride: null,
        numContributors: 2,
        numPosts: 2,
        posts: fakeThreadPosts,
        __typename: 'Idea'
      };
      const announcementProps = {
        announcementContent: announcementContent,
        idea: threadIdea,
        isMultiColumns: false
      };
      const component = renderer.create(<Announcement {...announcementProps} />);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
  describe('<Announcement /> on a multiColumns', () => {
    it('should render an announcement with the content associated to a multiColumns idea', () => {
      const positiveColumn = {
        color: 'green',
        columnSynthesis: {},
        index: 0,
        messageClassifier: 'positive',
        name: 'Positive',
        numPosts: 1,
        title: 'Positive',
        __typename: 'IdeaMessageColumn'
      };
      const negativeColumn = {
        color: 'red',
        columnSynthesis: {},
        index: 1,
        messageClassifier: 'negative',
        name: 'Negative',
        numPosts: 1,
        title: 'Negative',
        __typename: 'IdeaMessageColumn'
      };
      const messageColumns = [positiveColumn, negativeColumn];
      const fakeMultiColumnsPosts = {
        edges: [{ ...fakePost1, messageClassifier: 'positive' }, { ...fakePost2, messageClassifier: 'negative' }]
      };
      const multiColumnsIdea = {
        id: '12345',
        messageColumns: messageColumns,
        messageViewOverride: 'messageColumns',
        numContributors: 2,
        numPosts: 2,
        posts: fakeMultiColumnsPosts
      };
      const announcementProps = {
        announcementContent: announcementContent,
        idea: multiColumnsIdea,
        isMultiColumns: true
      };
      const component = renderer.create(<Announcement {...announcementProps} />);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
  describe('createDoughnutElements function', () => {
    it('should return an array of elements for a <StatisticDoughnut /> component', () => {
      const fakeSentimentCounts = {
        dontUnderstand: {
          type: 'DONT_UNDERSTAND',
          camelType: 'dontUnderstand',
          color: 'yellow',
          tooltip: {},
          count: 2,
          svgComponent: {
            defaultProps: {
              backgroundColor: '#ffffff',
              color: 'purple'
            }
          }
        },
        disagree: {
          type: 'DISAGREE',
          camelType: 'disagree',
          color: 'red',
          tooltip: {},
          count: 0,
          svgComponent: {
            defaultProps: {
              backgroundColor: '#ffffff',
              color: 'purple'
            }
          }
        },
        like: {
          type: 'LIKE',
          camelType: 'like',
          color: 'green',
          tooltip: {},
          count: 4,
          svgComponent: {
            defaultProps: {
              backgroundColor: '#ffffff',
              color: 'purple'
            }
          }
        },
        moreInfo: {
          type: 'MORE_INFO',
          camelType: 'moreinfo',
          color: 'purple',
          tooltip: {},
          count: 3,
          svgComponent: {
            defaultProps: {
              backgroundColor: '#ffffff',
              color: 'purple'
            }
          }
        }
      };
      const result = createDoughnutElements(fakeSentimentCounts);
      // We use snapshot instead of a handmade 'expected' constant
      // because there are issues with a diff of space characters in the DOM
      // which make the test fail for a bad reason
      expect(result).toMatchSnapshot();
    });
  });
  describe('createTooltip function', () => {
    it('should return a tooltip with the count for a given sentiment', () => {
      const sentimentDefinition = {
        camelType: 'like',
        color: '#46D081',
        count: 4,
        tooltip: {},
        type: 'LIKE',
        Svgcomponent: {}
      };
      const result = createTooltip(sentimentDefinition);
      expect(result).toMatchSnapshot();
    });
  });
  describe('getColumnInfos function', () => {
    it('should return an array of object containing the informations for each column', () => {
      const messageColumns = [
        {
          color: 'red',
          columnSynthesis: {},
          index: 0,
          messageClassifier: 'negative',
          name: 'Negative',
          numPosts: 3,
          title: 'Negative'
        },
        {
          color: 'green',
          columnSynthesis: {},
          index: 1,
          messageClassifier: 'positive',
          name: 'Positive',
          numPosts: 4,
          title: 'Positive'
        }
      ];
      const result = getColumnInfos(messageColumns);
      const expected = [
        {
          count: 3,
          color: 'red',
          name: 'Negative'
        },
        {
          count: 4,
          color: 'green',
          name: 'Positive'
        }
      ];
      expect(result).toEqual(expected);
    });
  });
  describe('getSentimentsCount function', () => {
    it('should return the counts of each sentiments given we pass it a Posts object', () => {
      const result = getSentimentsCount(fakeThreadPosts);
      expect(result).toMatchSnapshot();
    });
  });
  describe('dirtySplitHack function', () => {
    it('should return an object with descriptionBottom and desriptionTop properly set for an announcementContent', () => {
      const result = dirtySplitHack(announcementContent);
      const expected = {
        descriptionTop:
          '<p>Bonjour à tous</p><p>Nous allons mettre un deuxieme paragraphe</p><p>Et un peu de <strong>texte en gras</strong>',
        descriptionBottom: null,
        htmlCode: null,
        noTitle: true
      };
      expect(result).toEqual(expected);
    });
  });
});