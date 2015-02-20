
OPT := chromi3wm-opt.js
MAP := chromi3wm-opt.js.map

TGT := target/scala-2.11

all : $(OPT) $(MAP)

$(OPT) $(MAP) : src.scala
	sbt fastOptJS fullOptJS
	cp $(TGT)/$(OPT) $(OPT)
	sed -e 's=file://$(CURDIR)/==' $(TGT)/$(MAP) > $(MAP)

clean :
	rm -r project/{project,target} target

install :
	./Install

uninstall :
	./Install --uninstall

.PHONY : all clean install uninstall
