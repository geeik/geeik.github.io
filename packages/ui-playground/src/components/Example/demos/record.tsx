/* eslint-disable @typescript-eslint/no-use-before-define */

import { useLockFn } from 'ahooks';
import { Button, Space, message } from 'antd';
import React, { useRef, useState } from 'react';
import Recorder from 'recorder-core';

//引入mp3格式支持文件；如果需要多个格式支持，把这些格式的编码引擎js文件放到后面统统引入进来即可
import 'recorder-core/src/engine/mp3';
import 'recorder-core/src/engine/mp3-engine';
import 'recorder-core/src/engine/pcm';
//录制wav格式的用这一句就行
import 'recorder-core/src/engine/wav';

const Record = () => {
  const [recordStatus, setRecordStatus] = useState<boolean>(false);
  const record = useRef<any>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [recBlob, setRecBlob] = useState<any>();
  const getPermission = async () => {
    const newRec = Recorder({
      type: 'mp3',
      bitRate: 16,
      sampleRate: 16000, //阿里采样率16000
      onProcess: function (buffers, powerLevel, duration, bufferSampleRate) {
        console.log(buffers, powerLevel, duration, bufferSampleRate);
      },
    });
    return new Promise((resolve, reject) => {
      newRec.open(
        () => {
          console.log('newRec', newRec);
          record.current = newRec;
          resolve(true);
        },
        (msg, isUserNotAllow) => {
          //用户拒绝了录音权限，或者浏览器不支持录音
          reject((isUserNotAllow ? 'UserNotAllow，' : '') + '无法录音:' + msg);
        },
      );
    });
  };

  const startRecorder = useLockFn(async () => {
    try {
      await getPermission();
      if (record.current && Recorder.IsOpen()) {
        setRecordStatus(true);
        message.info('开始录制');
        record.current.start();
      }
    } catch (error) {
      setRecordStatus(false);
      message.error(error);
    }
  });

  const stopRecorder = () => {
    try {
      if (!record.current) {
        console.error('未打开录音');
        return;
      }

      record.current.stop((blob, duration) => {
        console.log('录音成功', blob, '时长:' + duration + 'ms');
        if (blob) {
          const formData = new FormData();
          formData.append('audio', blob);
          setRecBlob(blob);
        }

        message.success('录制成功');
        record.current.close();
        record.current = null;
      });
    } catch (err) {
      console.error('结束录音出错：' + err);
      record.current.close();
      record.current = null;
    } finally {
      setRecordStatus(false);
    }
  };

  return (
    <div>
      <Space>
        <Button
          disabled={recordStatus}
          onClick={startRecorder}
          type={!recordStatus ? 'primary' : 'default'}
        >
          开始录音
        </Button>
        <Button
          disabled={!recordStatus}
          type={recordStatus ? 'primary' : 'default'}
          onClick={stopRecorder}
        >
          停止录音
        </Button>

        <Button
          disabled={!recBlob}
          type="primary"
          onClick={async () => {
            if (audioRef.current && recBlob) {
              message.info('开始播放');
              console.log('recBlob', recBlob);
              audioRef.current.src = URL.createObjectURL(recBlob);

              audioRef.current.play();
            }
          }}
        >
          播放
        </Button>
      </Space>
      <audio ref={audioRef}></audio>
    </div>
  );
};

export default Record;
