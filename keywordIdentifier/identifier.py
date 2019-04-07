import textract
text = textract.process('1.pdf', method='pdfminer')
print(text)


