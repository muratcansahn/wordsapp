import { View, StyleSheet } from 'react-native';
import React, { useRef, forwardRef } from 'react';
import ShareOption from '@/components/common/share/ShareOption';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/theme/useTheme';
import BottomSheet from '@gorhom/bottom-sheet';
import { FLEX, MARGIN } from '@/constants/AppConstants';
import ViewShot from 'react-native-view-shot';

// This is working with Development Build
// import Share, { Social } from 'react-native-share';

const ShareBottomSheet = forwardRef<ViewShot, { colors: string[] }>(
  (props, ref) => {
    const { mode } = useTheme();
    const bottomSheetRef = useRef<BottomSheet>(null);

    const shareStory = async () => {
      try {
        // const uri = await ref?.current?.capture();
        // await Share.shareSingle({
        //   social: Share.Social.INSTAGRAM_STORIES as Social,
        //   backgroundBottomColor: props.colors[1],
        //   backgroundTopColor: props.colors[0],
        //   appId: 'YOUR_FACEBOOK_APP_ID',
        //   stickerImage: uri,
        // });
      } catch (error) {
        console.log('Error =>', error);
      }
    };
    const shareFacebookStory = async () => {
      try {
        // const uri = await ref?.current?.capture();
        // await Share.shareSingle({
        //   social: Share.Social.FACEBOOK_STORIES as Social,
        //   backgroundBottomColor: props.colors[1],
        //   backgroundTopColor: props.colors[0],
        //   appId: 'YOUR_FACEBOOK_APP_ID',
        //   stickerImage: uri,
        // });
      } catch (error) {
        console.log('Error =>', error);
      }
    };

    return (
      <BottomSheet
        snapPoints={['17%', '25%', '30%']}
        backgroundStyle={{
          backgroundColor: Colors[mode].button,
        }}
        handleIndicatorStyle={{
          backgroundColor: Colors[mode].text,
        }}
        enableDynamicSizing={false}
        ref={bottomSheetRef}
        index={0}
        style={{
          flex: 0.17,
        }}
      >
        <View style={styles.shareOptions}>
          <View style={styles.shareOptionsRow}>
            <ShareOption
              icon="instagram"
              label="Stories"
              color={Colors[mode].text}
              onPress={shareStory}
            />
            <ShareOption
              icon="facebook"
              label="Story"
              color={Colors[mode].text}
              onPress={shareFacebookStory}
            />
          </View>
        </View>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  shareOptions: {
    flex: FLEX.one,
  },
  shareOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: MARGIN.sm,
  },
});

export default ShareBottomSheet;
