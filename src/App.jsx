import { useState, useRef, useEffect } from 'react';
import "@mantine/core/styles.css";
import {
  AppShell,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Paper,
  Container,
  Anchor,
  ActionIcon,
  ColorSwatch,
  Box,
  useMantineTheme
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';

export default function App() {
  const theme = useMantineTheme();
  const clipboard = useClipboard();
  const [copyCount, setCopyCount] = useState(0);
  const [copyTimeout, setCopyTimeout] = useState(null);
  const contentEditableRef = useRef(null);

  // Initial content with example formatting (now with inline styles)
  const initialContent = `Welcome to&nbsp; <span class="ansi-45" style="background-color: ${getColor(45, theme)}; color: white;"><span class="ansi-37" style="color: ${getColor(37, theme)}">Discord</span></span>&nbsp;<span class="ansi-31" style="color: ${getColor(31, theme)}">C</span><span class="ansi-32" style="color: ${getColor(32, theme)}">o</span><span class="ansi-33" style="color: ${getColor(33, theme)}">l</span><span class="ansi-34" style="color: ${getColor(34, theme)}">o</span><span class="ansi-35" style="color: ${getColor(35, theme)}">r</span><span class="ansi-36" style="color: ${getColor(36, theme)}">e</span><span class="ansi-37" style="color: ${getColor(37, theme)}">d</span>&nbsp;Text Generator!`;

  // Color options
  const fgColors = [30, 31, 32, 33, 34, 35, 36, 37];
  const bgColors = [40, 41, 42, 43, 44, 45, 46, 47];

  const applyStyle = (ansiCode) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0){
      console.log("mohit")
      return;
    }
    console.log(selection);
    const range = selection.getRangeAt(0);
    console.log(range)
    const selectedText = selection.toString();
    if (!selectedText) return;

    const span = document.createElement('span');
    console.log(span);
    span.textContent = selectedText;
    span.className = `ansi-${ansiCode}`;
    
    // Apply inline styles for visual feedback
    if (ansiCode >= 30 && ansiCode < 40) {
      // Text color
      span.style.color = getColor(ansiCode, theme);
      // Reset background if this is a text color
      span.style.backgroundColor = '';
    } else if (ansiCode >= 40) {
      // Background color
      span.style.backgroundColor = getColor(ansiCode, theme);
      // Set text color to white for better visibility
      span.style.color = '#ffffff';
      span.style.padding = '0 2px';
    }
    
    if (ansiCode === 1) {
      span.style.fontWeight = 'bold';
    } else if (ansiCode === 4) {
      span.style.textDecoration = 'underline';
    }

    range.deleteContents();
    range.insertNode(span);

    // Select the new span
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(newRange);
  };

  const resetAll = () => {
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = initialContent;
    }
  };

  const nodesToANSI = (nodes, states) => {
    let text = '';
    Array.from(nodes).forEach((node) => {
      if (node.nodeType === 3) { // Text node
        text += node.textContent;
        return;
      }
      
      if (node.nodeName === 'BR') {
        text += '\n';
        return;
      }

      const ansiClass = node.className.match(/ansi-(\d+)/);
      if (!ansiClass) {
        text += nodesToANSI(node.childNodes, states);
        return;
      }

      const ansiCode = parseInt(ansiClass[1]);
      const newState = { ...states[states.length - 1] };

      if (ansiCode < 30) newState.st = ansiCode;
      if (ansiCode >= 30 && ansiCode < 40) newState.fg = ansiCode;
      if (ansiCode >= 40) newState.bg = ansiCode;

      states.push(newState);
      text += `\x1b[${newState.st};${ansiCode >= 40 ? newState.bg : newState.fg}m`;
      text += nodesToANSI(node.childNodes, states);
      states.pop();
      text += `\x1b[0m`;
      if (states[states.length - 1].fg !== 2) text += `\x1b[${states[states.length - 1].st};${states[states.length - 1].fg}m`;
      if (states[states.length - 1].bg !== 2) text += `\x1b[${states[states.length - 1].st};${states[states.length - 1].bg}m`;
    });
    return text;
  };

  const handleCopy = () => {
    const ansiText = "```ansi\n" + nodesToANSI(contentEditableRef.current.childNodes, [{ fg: 2, bg: 2, st: 2 }]) + "\n```";
    
    clipboard.copy(ansiText);
    
    if (copyTimeout) clearTimeout(copyTimeout);
    
    const timeout = setTimeout(() => setCopyCount(0), 2000);
    setCopyTimeout(timeout);
    setCopyCount(prev => Math.min(11, prev + 1));
  };

  useEffect(() => {
    return () => copyTimeout && clearTimeout(copyTimeout);
  }, [copyTimeout]);

  const funnyMessages = [
    "Copy text as Discord formatted",
    "Copied!", "Double Copy!", "Triple Copy!", "Dominating!!", 
    "Rampage!!", "Mega Copy!!", "Unstoppable!!", "Wicked Sick!!", 
    "Monster Copy!!!", "GODLIKE!!!", "BEYOND GODLIKE!!!!", 
    "COPY OVERLOAD!!!"
  ];

  return (
    <div style={{
      backgroundColor: '#36393F',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <Container size="sm" style={{ width: '100%' }}>
        <Stack spacing="xl" align="center">
          <Title order={1} align="center" style={{color:'white' , fontWeight:'bold'}}>
            <Text component="span" style={{ color: "#5865F2", fontSize: '2rem', fontWeight: 'bold' }}>Colored</Text > Text Generator
          </Title>
          
          <Box style={{ textAlign: 'center' }}>
            <Title order={3} mb="sm" align="center" style={{color:'white' , fontWeight:'bold'}}>About</Title>
            <Text align="center" style={{color:'white' , fontWeight:'bold'}}>
              This is a simple app that creates colored Discord messages using the ANSI color codes available on the latest Discord desktop versions.
            </Text>
            <Text mt="sm" align="center" style={{color:'white' , fontWeight:'bold'}}>
              To use this, write your text, select parts of it and assign colors to them, then copy it using the button below, and send in a Discord message.
            </Text>
          </Box>
          
          <Box style={{ textAlign: 'center' }}>
            <Title order={3} mb="sm" align="center" style={{color:'white' , fontWeight:'bold'}} >Source Code</Title>
            <Text align="center" style={{color:'white' , fontWeight:'bold'}}>
              This app runs entirely in your browser and the source code is freely available on{' '}
              <Anchor href="" target="_blank">
                GitHub
              </Anchor>. Shout out to kkrypt0nn for{' '}
              <Anchor href="" target="_blank">
                this guide
              </Anchor>.
            </Text>
          </Box>
          
          <Title order={2} align="center" style={{color:'white' , fontWeight:'bold'}}>Create your text</Title>
          
          <Group position="center">
            <Button onClick={resetAll} variant="default">Reset All</Button>
            <Button 
              onClick={() => applyStyle(1)} 
              variant="outline" 
              styles={{ root: { fontWeight: 700 } }}
            >
              Bold
            </Button>
            <Button 
              onClick={() => applyStyle(4)} 
              variant="outline" 
              styles={{ root: { textDecoration: 'underline', fontWeight: 500 } }}
            >
              Underline
            </Button>
          </Group>
          
          <Group position="center">
            <Text weight={500} style={{color:'white' , fontWeight:'bold'}}>Text Color</Text>
            {fgColors.map(code => (
              <ActionIcon 
                key={code} 
                onClick={() => applyStyle(code)}
                size="lg"
                style={{ backgroundColor: getColor(code, theme) }}
              >
                &nbsp;
              </ActionIcon>
            ))}
          </Group>
          
          <Group position="center">
            <Text weight={500} style={{color:'white' , fontWeight:'bold'}}>Background</Text>
            {bgColors.map(code => (
              <ActionIcon  
                key={code} 
                color={getColor(code, theme)} 
                onClick={() => applyStyle(code)}
                style={{ cursor: 'pointer' }}
              >
              &nbsp;
              </ActionIcon>
            ))}
          </Group>
          
          <Paper 
            p="sm" 
            withBorder 
            shadow="xs"
            style={{
              backgroundColor: '#2F3136',
              minHeight: 200,
              textAlign: 'left',
              fontFamily: 'monospace',
              color: '#B9BBBE',
              whiteSpace: 'pre-wrap',
              border: '1px solid #202225',
              width: '100%'
            }}
          >
            <div
              ref={contentEditableRef}
              contentEditable
              dangerouslySetInnerHTML={{ __html: initialContent }}
              style={{
                outline: 'none',
                minHeight: '100%',
                fontSize: '0.875rem',
                lineHeight: '1.125rem'
              }}
              onInput={(e) => {
                const base = e.currentTarget.innerHTML.replace(/<(\/?(br|span|span class="ansi-\d+"))>/g, "[$1]");
                if (base.includes("<") || base.includes(">")) {
                  e.currentTarget.innerHTML = base.replace(/<.*?>/g, "")
                    .replace(/[<>]/g, "")
                    .replace(/\[(\/?(br|span|span class="ansi-\d+"))\]/g, "<$1>");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  document.execCommand('insertLineBreak');
                  e.preventDefault();
                }
              }}
            />
          </Paper>
          
          <Button 
            onClick={handleCopy}
            color={copyCount <= 8 ? 'teal' : 'red'}
            fullWidth
            size="lg"
            styles={{
              root: {
                backgroundColor: copyCount <= 8 ? '#3BA55D' : '#ED4245',
                transition: 'background-color 250ms linear'
              }
            }}
          >
            {funnyMessages[copyCount] || "Copy text as Discord formatted"}
          </Button>
          
          <Text size="sm" color="dimmed" align="center">
            This is an unofficial tool, it is not made or endorsed by Discord.
          </Text>
        </Stack>
      </Container>
    </div>
  );
}

// Helper function to get color values
function getColor(code, theme) {
  const colorMap = {
    30: '#4f545c', 31: '#dc322f', 32: '#859900', 33: '#b58900',
    34: '#268bd2', 35: '#d33682', 36: '#2aa198', 37: '#ffffff',
    40: '#002b36', 41: '#cb4b16', 42: '#586e75', 43: '#657b83',
    44: '#839496', 45: '#6c71c4', 46: '#93a1a1', 47: '#fdf6e3'
  };
  return colorMap[code];
}