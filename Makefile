
OPT := chromi3wm-opt.js
MAP := chromi3wm-opt.js.map

TGT := target/scala-2.11

all : $(OPT) $(MAP)

$(OPT) : $(TGT)/$(OPT)
	cp -p $< $@

$(MAP) : $(TGT)/$(MAP) Makefile
	sed -e 's=file://$(CURDIR)/==' $< > $@

$(TGT)/$(OPT) $(TGT)/$(MAP) : src.scala
	sbt fastOptJS fullOptJS

install :
	./Install

uninstall :
	./Install --uninstall

